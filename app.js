d3.csv('./data/all_data.csv', function(d) {
  return {
    continent: d.Continent,
    country: d.Country,
    countryCode: d["Country Code"],
    emissions: +d["Total Emissions"],
    emissionsPerCapita: +d["Emissions Per Capita"],
    region: d.Region,
    year: +d.Year
  }
}, function(error, data) {
  if (error) throw error;

  
});