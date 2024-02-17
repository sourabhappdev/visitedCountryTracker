import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({

  user: "postgres",
  host: "localhost",
  database: "world",
  password: "3295",
  port: 5432

});

db.connect();


async function checkVisited() {


  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  console.log(countries);
  return countries;

}

app.get("/", async (req, res) => {

  const countries = await checkVisited();
  res.render("index.ejs", { countries: countries, total: countries.length });
});




app.post("/add", async (req, res) => {
  let input = req.body.country;
  console.log(input.toUpperCase());
  try {
    const result = await db.query("SELECT country_code FROM countries WHERE country_name LIKE '%' || $1 || '%' ;", [input]);

    if (result.rows.length !== 0) {
      const data = result.rows[0];
      const countryCode = data.country_code;
      console.log(countryCode);

      try {
        await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [
          countryCode,
        ]);
        res.redirect("/");
      } catch (error) {
        console.log(error);
        const countries = await checkVisited();
        res.render("index.ejs", {
          countries: countries,
          total: countries.length,
          error: "Country has already been added, try again.",
        });

      }


    }


  } catch (error) {

    console.log(error);
    const countries = await checkVisited();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });

  }



});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
