GET {{hurlin-import}}../csrf.hurl
HTTP 200
[Captures]
token: jsonpath "$['XSRF-TOKEN']"
csrf: jsonpath "$['_csrf']"


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
	"address": "nowhere",
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

POST {{hurlin-export}}
{
  "id": {{id}}
}
HTTP 200
