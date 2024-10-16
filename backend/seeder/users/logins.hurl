GET {{hurlin-async}}./create.hurl
HTTP 200
[Captures]
wait_on: jsonpath "$.await"

GET {{hurlin-import}}../csrf.hurl
HTTP 200
[Captures]
token: jsonpath "$['XSRF-TOKEN']"
csrf: jsonpath "$['_csrf']"


# login as reviewer
GET {{hurlin-import}}./accounts.hurl
HTTP 200
[Captures]
R_email: jsonpath "$.review.email"
R_password: jsonpath "$.review.password" 
L_email: jsonpath "$.landowner.email"
L_password: jsonpath "$.landowner.password" 

GET {{hurlin-await}}{{wait_on}}
HTTP 200


POST {{api}}/session
XSRF-TOKEN: {{token}}
Cookie: _csrf={{csrf}}
{
  "credential": "{{R_email}}",
  "password": "{{R_password}}"
}
HTTP 200
[Captures]
review: cookie "token"

POST {{api}}/session
XSRF-TOKEN: {{token}}
Cookie: _csrf={{csrf}}
{
  "credential": "{{L_email}}",
  "password": "{{L_password}}"
}
HTTP 200
[Captures]
landowner: cookie "token"


POST {{hurlin-export}}
{
  "review": "{{review}}",
  "landowner": "{{landowner}}"
}
HTTP 200

