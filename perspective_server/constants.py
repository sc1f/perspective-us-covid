import os
import pandas as pd

here = os.path.abspath(os.path.dirname(__file__))

# State-level data from the COVID Tracking Project, county-level data from The New York Times
STATE_URL = "https://covidtracking.com/api/states/daily"
COUNTY_URL = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv"

# Population and unemployment data from 2018, as that is the last best estimate. Datasets provided by the U.S. Census and the USDA.
STATE_POPULATION_PATH = os.path.abspath(os.path.join(here, "data", "state_population_2019.csv"))
COUNTY_POPULATION_PATH = os.path.abspath(os.path.join(here, "data", "county_population_2018.csv"))
COUNTY_UNEMPLOYMENT_PATH = os.path.abspath(os.path.join(here, "data", "county_unemployment_2018.csv"))

# Standardize on abbreviations for states, and full names in 'stateName'
US_STATE_ABBREVIATIONS = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District of Columbia': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Northern Mariana Islands':'MP',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virgin Islands': 'VI',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY',
    "American Samoa": "AS",
    "Guam": "GU",
    "Northern Mariana Islands": "MP"
}

US_STATE_FULL_NAMES = {key: value for (value, key) in US_STATE_ABBREVIATIONS.items()}

# Political alignment of each state's governor, house, and legislature
def _make_state_government_alignment_df():
    exceptions = {
        "AK": {"State": "AK", "Governor": "Republican", "State Senate": "Republican", "State House": "Split"},
        "DC": {"State": "DC", "Governor": "N/A", "State Senate": "N/A", "State House": "N/A"},
        "KS": {"State": "KS", "Governor": "Democrat", "State Senate": "Republican", "State House": "Republican"},
        "KY": {"State": "KY", "Governor": "Democrat", "State Senate": "Republican", "State House": "Republican"},
        "LA": {"State": "LA", "Governor": "Democrat", "State Senate": "Republican", "State House": "Republican"},
        "MA": {"State": "MA", "Governor": "Republican", "State Senate": "Democrat", "State House": "Democrat"},
        "MD": {"State": "MD", "Governor": "Republican", "State Senate": "Democrat", "State House": "Democrat"},
        "MI": {"State": "MI", "Governor": "Democrat", "State Senate": "Republican", "State House": "Republican"},
        "MN": {"State": "MN", "Governor": "Democrat", "State Senate": "Republican", "State House": "Democrat"},
        "MT": {"State": "MT", "Governor": "Democrat", "State Senate": "Republican", "State House": "Republican"},
        "NC": {"State": "NC", "Governor": "Democrat", "State Senate": "Republican", "State House": "Republican"},
        "NH": {"State": "NH", "Governor": "Republican", "State Senate": "Democrat", "State House": "Democrat"},
        "PA": {"State": "PA", "Governor": "Democrat", "State Senate": "Republican", "State House": "Republican"},
        "PR": {"State": "PR", "Governor": "New Progressive", "State Senate": "New Progressive", "State House": "New Progressive"},
        "VI": {"State": "VI", "Governor": "Democrat", "State Senate": "N/A", "State House": "N/A"},
        "VT": {"State": "VT", "Governor": "Republican", "State Senate": "Democrat", "State House": "Democrat"},
        "WI": {"State": "WI", "Governor": "Democrat", "State Senate": "Republican", "State House": "Republican"},
        "AS": {"State": "AS", "Governor": "Democrat", "State Senate": "N/A", "State House": "N/A"},
        "GU": {"State": "GU", "Governor": "Democrat", "State Senate": "N/A", "State House": "N/A"},
        "MP": {"State": "MP", "Governor": "Republican", "State Senate": "N/A", "State House": "N/A"},
    }
    republican = ["AL", "AZ", "AR", "FL", "GA", "ID", "IN", "IA", "MS", "MO", "NE", "ND", "OH", "OK", "SC", "SD", "TN", "TX", "UT", "WV", "WY"]
    democrat = ["CA", "CO", "CT", "DE", "HI", "IL", "ME", "NV", "NJ", "NM", "NY", "OR", "RI", "VA", "WA"]

    data = []
    for state in US_STATE_ABBREVIATIONS.values():
        if state in exceptions:
            data.append(exceptions[state])
        elif state in republican:
            data.append({"State": state, "Governor": "Republican", "State Senate": "Republican", "State House": "Republican"})
        elif state in democrat:
            data.append({"State": state, "Governor": "Democrat", "State Senate": "Democrat", "State House": "Democrat"})
        else:
            raise ValueError("{0} does not exist in lookup".format(state))
    return pd.DataFrame(data)

STATE_GOVERNMENT_ALIGNMENT = _make_state_government_alignment_df()