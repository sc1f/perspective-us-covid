# State-level data from the COVID Tracking Project, county-level data from USAFacts
STATE_URL = "https://covidtracking.com/api/states/daily"
COUNTY_CONFIRMED_URL = "https://static.usafacts.org/public/data/covid-19/covid_confirmed_usafacts.csv"
COUNTY_DEATHS_URL = "https://static.usafacts.org/public/data/covid-19/covid_deaths_usafacts.csv"

# Population and unemployment data from 2018, as that is the last best estimate. Datasets provided by the U.S. Census and the USDA.
STATE_POPULATION_URL = "http://www2.census.gov/programs-surveys/popest/datasets/2010-2019/national/totals/nst-est2019-popchg2010_2019.csv?#"
COUNTY_POPULATION_URL = "https://www.ers.usda.gov/webdocs/DataFiles/48747/PopulationEstimates.csv?v=3011.3"
COUNTY_UNEMPLOYMENT_URL = "https://www.ers.usda.gov/webdocs/DataFiles/48747/Unemployment.csv?v=2564.4"

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
    'Palau': 'PW',
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