GET {{hurlin-import}}../csrf.hurl
HTTP 200
[Captures]
token: jsonpath "$['XSRF-TOKEN']"
csrf: jsonpath "$['_csrf']"

GET {{hurlin-noise}}
HTTP 200
[Captures]
noise: jsonpath "$.noise"


# login as landowner
GET {{hurlin-import}}../users/logins.hurl
HTTP 200
[Captures]
L_tok: jsonpath "$.landowner"

# landowner spot
POST {{api}}/spots
XSRF-TOKEN: {{token}}
Cookie: _csrf={{csrf}}; token={{L_tok}}
{
	"address": "{{noise}}",
	"city": "Threadsdale",
	"state": "WY",
	"country": "US",
	"lat": 42.9662275,
	"lng": -108.0898237,
	"name": "Uncle Johns Riverside Cabin",
	"description": "Come fishing with us and ride the waves at our beachfront resort*",
	"price": 400.0
}
HTTP 201
[Captures]
id: jsonpath "$.id"

POST {{api}}/spots/{{id}}/images
XSRF-TOKEN: {{token}}
Cookie: _csrf={{csrf}}; token={{L_tok}}
# public domain image
{
  "preview": false,
  "url": "https://live.staticflickr.com/65535/51583026483_7b4cff5f19_b.jpg"
}
HTTP 201

POST {{api}}/spots/{{id}}/images
XSRF-TOKEN: {{token}}
Cookie: _csrf={{csrf}}; token={{L_tok}}
# public domain image
{
  "preview": true,
  "url": "https://live.staticflickr.com/65535/51599980594_876369b5e3_b.jpg"
}
HTTP 201


POST {{hurlin-export}}
{
  "id": {{id}}
}
HTTP 200
