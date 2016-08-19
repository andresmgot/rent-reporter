# Rent flat searcher
# Install
Install phantomJS + CasperJS then:
`npm install`

# Report new matches
Report new matches via mail in the web pages you are interested in. Supported pages are:
 - idealista.com
 - enalquiler.com
 - milanuncios.com
 - fotocasa.es
 - vibbo.com

## Usage
`node index.js`

## Configure
You will need to configure your SMTP credentials and the webpages you want to watch. This would be an example:
config.json:
```json
{
  "smtpConfig": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "yourmail@gmail.com",
      "pass": "yourpassword"
    }
  },
  "mailOptions": {
    "from": "yourmail@gmail.com",
    "to": "yourdestinationmail@gmail.com",
    "subject": "Pisos"
  },
  "pages": [
    "https://www.idealista.com/alquiler-viviendas/madrid/chamberi/vallehermoso/"
  ]
}
```
