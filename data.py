import json
import logging
import requests
import pytz
import pandas as pd
from datetime import date, datetime
from dateutil import parser
from io import StringIO
from perspective import Table
from constants import STATE_URL, COUNTY_URL, \
                       STATE_POPULATION_PATH, COUNTY_POPULATION_PATH, \
                       COUNTY_UNEMPLOYMENT_PATH, US_STATE_ABBREVIATIONS, \
                       US_STATE_FULL_NAMES, STATE_GOVERNMENT_ALIGNMENT

logging.basicConfig(format="%(asctime)s - %(message)s", level=logging.INFO)

class DataTransformer(object):
    """Makes requests to the dataset APIs and outputs a DataFrame containing
    cleaned, transformed, and augmented data ready for Perspective."""

    EST = pytz.timezone("US/Eastern")

    @classmethod
    def _localize_column(cls, column):
        column = pd.to_datetime(column)
        aware = isinstance(column.dtype, pd.core.dtypes.dtypes.DatetimeTZDtype)
        if aware:
            return column.dt.tz_convert(cls.EST)
        else:
            return column.dt.tz_localize(cls.EST)

    @classmethod
    def _clean_state_data(cls, data):
        state_df = data.rename(columns={
            "date": "Date",
            "state": "State Name",
            "fips": "State FIPS",
            "cases": "Confirmed",
            "deaths": "Deaths"
        })
        # Perspective treats times as UTC, but we want to normalize all times to EST
        state_df["Date"] = cls._localize_column(state_df["Date"])
        state_df["State"] = [US_STATE_ABBREVIATIONS.get(x, None) for x in state_df["State Name"]]

        return state_df

    @classmethod
    def _clean_county_data(cls, data):
        county_df = data.rename(columns={
            "date": "Date",
            "state": "State Name",
            "fips": "County FIPS",
            "county": "County",
            "cases": "Confirmed",
            "deaths": "Deaths"
        })
        county_df["State"] = [US_STATE_ABBREVIATIONS.get(x, None) for x in county_df["State Name"]]
        county_df["Date"] = cls._localize_column(county_df["Date"])
        county_df.set_index(["County FIPS", "Date"])

        return county_df

    @classmethod
    def _fold_nyc(cls, data):
        """In county-level datasets, NYC is split into its five counties, but in the COVID dataset NYC
        is treated as one county. Take the county-level dataset and collapse NYC into one county
        under County FIPS 36061, which belongs to Manhattan (New York County).
        """
        nyc_counties = data[data["County"].isin(["Kings County", "Queens County", "New York County", "Bronx County", "Richmond County", "Kings County, NY", "Queens County, NY", "New York County, NY", "Bronx County, NY", "Richmond County, NY"])]
        nyc_counties = nyc_counties[nyc_counties["State"] == "NY"]
        return nyc_counties
        

    @classmethod
    def state_data(cls):
        """Retrieve CSVs containing state-level COVID data and
        state-level population data and return a DataFrame containing
        the joined and cleaned data.
        """
        state_covid_df = cls._clean_state_data(pd.read_csv(STATE_URL, error_bad_lines=False))

        # Get and clean population data
        state_population_df = pd.read_csv(
            STATE_POPULATION_PATH, usecols=["STATE", "NAME", "POPESTIMATE2019"]) \
                .rename(columns={"POPESTIMATE2019": "Population (2019 Estimate)", "NAME": "State Name", "STATE": "State FIPS"}) \
                .set_index("State FIPS")
        state_population_df["State"] = [US_STATE_ABBREVIATIONS.get(x, None) for x in state_population_df["State Name"]]

        # Remove region population
        state_population_df = state_population_df[state_population_df["State"].notnull()]

        merged = state_covid_df \
            .merge(state_population_df[["Population (2019 Estimate)", "State"]], on="State") \
            .merge(STATE_GOVERNMENT_ALIGNMENT[["Governor", "State Senate", "State House", "State"]], on="State")

        logging.info("Finished cleaning and merging state data")
        return merged

    @classmethod
    def county_data(cls):
        """Retrieve CSVs containing the county-level COVID confirmed cases
        and COVID deaths (they are in separate CSVs from USAFacts), as well
        as county-level unemployment and population data (and other datasets
        to come), return a DataFrame containing the joined and cleaned
        dataset.
        """
        county_df = cls._clean_county_data(pd.read_csv(COUNTY_URL, error_bad_lines=False))
        logging.info("Finished cleaning county COVID data")

        # Augment with county-level population and unemployment
        county_population_df = pd.read_csv(
            COUNTY_POPULATION_PATH, encoding="latin1", usecols=["FIPS", "State", "Area_Name", "POP_ESTIMATE_2018"]) \
            .rename(columns={"POP_ESTIMATE_2018": "Population (2018 Estimate)", "Area_Name": "County", "FIPS": "County FIPS"}) \
            .set_index("County FIPS")
        county_population_df["Population (2018 Estimate)"] = pd.to_numeric(county_population_df["Population (2018 Estimate)"].str.replace(",","").astype(float))
        
        # Fold NYC into one county
        nyc_population_df = cls._fold_nyc(county_population_df)
        population = nyc_population_df["Population (2018 Estimate)"].sum()

        folded_population = pd.DataFrame([{
            "County FIPS": 36061,
            "State": "NY",
            "County": "New York City",
            "Population (2018 Estimate)": population,
            "State Name": "New York"
        }]).set_index("County FIPS")

        county_population_df = county_population_df.drop([36005, 36047, 36081, 36085])
        county_population_df = county_population_df.append(folded_population, sort=True)
        logging.info("Finished cleaning county population data")

        # Add unemployment data
        county_unemployment_df = pd.read_csv(
            COUNTY_UNEMPLOYMENT_PATH, encoding="latin1", usecols=["FIPS", "State", "Area_name", "Unemployment_rate_2018", "Median_Household_Income_2018", "Civilian_labor_force_2018", "Employed_2018", "Unemployed_2018"]) \
            .rename(columns={
                    "Unemployment_rate_2018": "Unemployment Rate % (2018 Estimate)",
                    "Civilian_labor_force_2018": "Civilian Labor Force (2018 Estimate)",
                    "Employed_2018": "Employed (2018 Estimate)",
                    "Unemployed_2018": "Unemployed (2018 Estimate)",
                    "Median_Household_Income_2018": "Median Household Income (2018 Estimate)",
                    "Area_name": "County",
                    "FIPS": "County FIPS"
                }) \
            .set_index("County FIPS")

        for col in ["Civilian Labor Force (2018 Estimate)", "Employed (2018 Estimate)", "Unemployed (2018 Estimate)"]:
            county_unemployment_df[col] =  pd.to_numeric(county_unemployment_df[col].str.replace(",","").astype(float))

        county_unemployment_df["Median Household Income (2018 Estimate)"] =  pd.to_numeric([None if str(x) == "nan" else str(x).replace(",","").replace("$","") for x in county_unemployment_df["Median Household Income (2018 Estimate)"]])

        nyc_unemployment_df = cls._fold_nyc(county_unemployment_df)
        nyc_folded_unemployment = pd.DataFrame([{
            "County FIPS": 36061,
            "State": "NY",
            "County": "New York City",
            "Civilian Labor Force (2018 Estimate)": nyc_unemployment_df["Civilian Labor Force (2018 Estimate)"].sum(),
            "Employed (2018 Estimate)": nyc_unemployment_df["Employed (2018 Estimate)"].sum(),
            "Unemployed (2018 Estimate)": nyc_unemployment_df["Unemployed (2018 Estimate)"].sum(),
            "Unemployment Rate % (2018 Estimate)": nyc_unemployment_df["Unemployment Rate % (2018 Estimate)"].sum(),
            "Median Household Income (2018 Estimate)": nyc_unemployment_df["Median Household Income (2018 Estimate)"].sum(),
            "State Name": "New York"
        }]).set_index("County FIPS")
        
        # Drop old counties
        county_unemployment_df = county_unemployment_df.drop([36005, 36047, 36081, 36085])
        county_unemployment_df = county_unemployment_df.append(nyc_folded_unemployment, sort=True)

        # county_df = county_df \
        #     .join(county_population_df["Population (2018 Estimate)"], on="County FIPS") \
        #     .join(county_unemployment_df[["Unemployment Rate % (2018 Estimate)", "Unemployed (2018 Estimate)", "Employed (2018 Estimate)", "Civilian Labor Force (2018 Estimate)", "Median Household Income (2018 Estimate)"]], on="County FIPS")
        # print(len(county_df))
        county_df = county_df[county_df["County"] != "Statewide Unallocated"]
        logging.info("Finished cleaning county unemployment data")
        return county_df


class DataHost(object):
    """Stores cleaned and transformed DataFrames in memory as `perspective.Table`s,
    and provides getters for the `Table`s to be used elsewhere."""

    def __init__(self):
        self.state_schema = {
            "Date": date,
            "Deaths": int,
            "Confirmed": int,
            "Population (2019 Estimate)": int,
            "State": str,
            "State Name": str,
            "Governor": str,
            "State Senate": str,
            "State House": str
        }

        self.county_schema = {
            "County FIPS": int,
            "County": str,
            "State": str,
            "State Name": str,
            "Date": date,
            "Confirmed": int,
            "Deaths": int,
            # "Population (2018 Estimate)": int,
            # "Unemployment Rate % (2018 Estimate)": int,
            # "Unemployed (2018 Estimate)": int,
            # "Employed (2018 Estimate)": int,
            # "Civilian Labor Force (2018 Estimate)": int,
            # "Median Household Income (2018 Estimate)": float
        }

        self._state_data = DataTransformer.state_data()
        self._county_data = DataTransformer.county_data()
        self.state_table = Table(self.state_schema)
        self.county_table = Table(self.county_schema)

        logging.info("Tables initialized with schema")

        # Call `update` on the `Table` with the datset
        self.state_table.update(self._state_data)
        self.county_table.update(self._county_data)

        logging.info("Tables updated with latest dataset")

    def write_data_to_arrow(self):
        pass