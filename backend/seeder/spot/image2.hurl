GET {{hurlin-import}}../csrf.hurl
HTTP 200
[Captures]
token: jsonpath "$['XSRF-TOKEN']"
csrf: jsonpath "$['_csrf']"

GET {{hurlin-import}}./new.hurl
HTTP 200
[Captures]
id: jsonpath "$.id"


GET {{hurlin-import}}../users/logins.hurl
HTTP 200
[Captures]
landowner_tok: jsonpath "$.landowner"


POST {{api}}/spots/{{id}}/images
XSRF-TOKEN: {{token}}
Cookie: _csrf={{csrf}}; token={{landowner_tok}}
# public domain image
{
  "preview": false,
  "url": "https://live.staticflickr.com/65535/51583026483_7b4cff5f19_b.jpg"
}
HTTP 201
