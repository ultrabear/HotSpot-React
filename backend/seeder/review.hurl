GET {{hurlin-import}}./csrf.hurl
HTTP 200
[Captures]
token: jsonpath "$['XSRF-TOKEN']"
csrf: jsonpath "$['_csrf']"

GET {{hurlin-import}}./spot/new.hurl
HTTP 200
[Captures]
id: jsonpath "$.id"


GET {{hurlin-import}}./users/logins.hurl
HTTP 200
[Captures]
review_tok: jsonpath "$.review"


POST {{api}}/spots/{{id}}/reviews
XSRF-TOKEN: {{token}}
Cookie: _csrf={{csrf}}; token={{review_tok}}
{
  "review": "come on down and bring your kids to the amazing beachfront resort that Uncle Johns Riverside Cabin was, I loved the nearby shops and ice cream parlor, along with all of the amenities you would expect from a place costing thousands per day, despite only costing $400/day!",
  "stars": 5
}
HTTP 201
