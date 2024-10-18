GET {{hurlin-async}}./accounts.hurl
HTTP 200
[Captures]
landowner_key: jsonpath "$.await"

GET {{hurlin-import}}../csrf.hurl
HTTP 200
[Captures]
token: jsonpath "$['XSRF-TOKEN']"
csrf: jsonpath "$['_csrf']"


POST {{api}}/users
XSRF-TOKEN: {{token}}
Cookie: _csrf={{csrf}}
{
  "email": "demo@user.io",
  "username": "Demo-lition",
  "firstName": "Demo",
  "lastName": "Doe",
  "password": "password"
}
HTTP 201


POST {{api}}/users
XSRF-TOKEN: {{token}}
Cookie: _csrf={{csrf}}
{
  "email": "user1@user.io",
  "username": "FakeUser1",
  "firstName": "Jane",
  "lastName": "Doe",
  "password": "password2"
}
HTTP 201

POST {{api}}/users
XSRF-TOKEN: {{token}}
Cookie: _csrf={{csrf}}
{
  "email": "user2@user.io",
  "username": "FakeUser2",
  "firstName": "among",
  "lastName": "Us",
  "password": "foopassword"
}
HTTP 201

GET {{hurlin-await}}{{landowner_key}}
HTTP 200
[Captures]
L_email: jsonpath "$.landowner.email"
L_username: jsonpath "$.landowner.username"
L_firstName: jsonpath "$.landowner.firstName"
L_lastName: jsonpath "$.landowner.lastName"
L_password: jsonpath "$.landowner.password" 

R_email: jsonpath "$.review.email"
R_username: jsonpath "$.review.username"
R_firstName: jsonpath "$.review.firstName"
R_lastName: jsonpath "$.review.lastName"
R_password: jsonpath "$.review.password" 

POST {{api}}/users
XSRF-TOKEN: {{token}}
Cookie: _csrf={{csrf}}
{
  "email": "{{L_email}}",
  "username": "{{L_username}}",
  "firstName": "{{L_firstName}}",
  "lastName": "{{L_lastName}}",
  "password": "{{L_password}}"
}
HTTP 201


POST {{api}}/users
XSRF-TOKEN: {{token}}
Cookie: _csrf={{csrf}}
{
  "email": "{{R_email}}",
  "username": "{{R_username}}",
  "firstName": "{{R_firstName}}",
  "lastName": "{{R_lastName}}",
  "password": "{{R_password}}"
}
HTTP 201
