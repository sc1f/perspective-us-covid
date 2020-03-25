import json
import requests
import pytz
import pandas as pd
from datetime import date, datetime
from dateutil import parser
from io import StringIO
from perspective import Table
from constants import STATE_URL, COUNTY_CONFIRMED_URL, COUNTY_DEATHS_URL, \
                       STATE_POPULATION_URL, COUNTY_POPULATION_URL, \
                       COUNTY_UNEMPLOYMENT_URL, US_STATE_ABBREVIATIONS, \
                       US_STATE_FULL_NAMES

class DataTransformer(object):
    """Makes requests to the dataset APIs and outputs a DataFrame containing
    cleaned, transformed, and augmented data ready for Perspective."""

    # Need to rename columns as they come out of the dataset
    state_column_names = {
        "date": "Date",
        "dateChecked": "Date Checked",
        "death": "Deaths",
        "hospitalized": "Hospitalized",
        "pending": "Pending",
        "positive": "Positive",
        "total": "Total",
        "state": "State"
    }

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
        for row in data:
            # dates are stored as integer with no separators, so add separators and parse
            d = list(str(row["date"]))
            if "/" not in d:
                d.insert(4, "/")
                d.insert(7, "/")
            row["date"] = "".join(d)
            row["date"] = parser.parse(row["date"])
            row["dateChecked"] = parser.parse(row["dateChecked"])

        df = pd.DataFrame(data).rename(columns=cls.state_column_names)

        # Perspective treats times as UTC, but we want to normalize all times to EST
        df["Date"] = cls._localize_column(df["Date"])
        df["Date Checked"] = cls._localize_column(df["Date Checked"])
        df["State Name"] = [US_STATE_FULL_NAMES.get(x, None) for x in df["State"]]

        return df

    @classmethod
    def state_data(cls):
        """Retrieve CSVs containing state-level COVID data and
        state-level population data and return a DataFrame containing
        the joined and cleaned data.
        """
        state_covid_df = cls._clean_state_data(requests.get(STATE_URL).json())

        # Get and clean population data
        state_population = StringIO(requests.get(STATE_POPULATION_URL).text)
        state_population_df = pd.read_csv(
            state_population, usecols=["STATE", "NAME", "POPESTIMATE2019"]) \
                .rename(columns={"POPESTIMATE2019": "Population (2019 Estimate)", "NAME": "State Name", "STATE": "State FIPS"}) \
                .set_index("State FIPS")
        state_population_df["State"] = [US_STATE_ABBREVIATIONS.get(x, None) for x in state_population_df["State Name"]]

        # Remove region population
        state_population_df = state_population_df[state_population_df["State"].notnull()]

        merged = state_covid_df.merge(state_population_df[["Population (2019 Estimate)", "State"]], on="State")
        return merged

    @classmethod
    def county_data(cls):
        """Retrieve CSVs containing the county-level COVID confirmed cases
        and COVID deaths (they are in separate CSVs from USAFacts), as well
        as county-level unemployment and population data (and other datasets
        to come), return a DataFrame containing the joined and cleaned
        dataset.
        """
        return {}


class DataHost(object):
    """Stores cleaned and transformed DataFrames in memory as `perspective.Table`s,
    and provides getters for the `Table`s to be used elsewhere."""

    def __init__(self):
        self.state_schema = {
            "Date": date,
            "Date Checked": datetime,
            "Deaths": int,
            "Hospitalized": int,
            "Pending": int,
            "Positive": int,
            "Total": int,
            "State": str,
            "State Name": str,
            "Population (2019 Estimate)": int
        }

        self.county_schema = {
            "County FIPS": int,
            "State FIPS": int,
            "County": str,
            "State": str,
            "State Name": str,
            "Date": date,
            "Confirmed": int,
            "Deaths": int,
            "Population (2018 Estimate)": int,
            "Unemployment Rate (2018 Estimate)": int,
            "Unemployed (2018 Estimate)": int,
            "Employed (2018 Estimate)": int,
            "Civilian Labor Force (2018 Estimate)": int,
            "Median Household Income (2018 Estimate)": float
        }

        self._state_data = DataTransformer.state_data()
        self._county_data = DataTransformer.county_data()
        self.state_table = Table(self.state_schema)
        self.county_table = Table(self.county_schema)

        # Call `update` on the `Table` with the datset
        self.state_table.update(self._state_data)
        # self.county_table.update(self._county_data)