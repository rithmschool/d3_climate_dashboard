import csv

def find_country_data_by_name(data, name):
    for country in data:
        if country[0] == name:
            return country
    return None

with open('country_data.csv') as country_csv:
    country_reader = csv.reader(country_csv)
    country_rows = list(country_reader)[1:]
    with open('UN_Climate_Data.csv') as climate_csv:
        climate_reader = csv.reader(climate_csv)
        climate_rows = list(climate_reader)[1:]
        with open('all_data.csv', 'w') as newfile:
            headers = [
                "Country",
                "Country Code",
                "Continent", 
                "Region",
                "Year",
                "Emissions Per Capita",
                "Total Emissions"
            ]
            writer = csv.writer(newfile)
            writer.writerow(headers)
            for row in climate_rows:
                country_row = find_country_data_by_name(country_rows, row[0])
                writer.writerow([
                    row[0],
                    country_row[3] if country_row else "???",
                    country_row[5] if country_row else "???",
                    country_row[6] if country_row else "???",
                    row[1],
                    row[2],
                    row[3]
                ])