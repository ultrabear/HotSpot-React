
GET {{hurlin-async}}./users/create.hurl
HTTP 200
[Captures]
await1: jsonpath "$.await"

GET {{hurlin-import}}./review.hurl
HTTP 200

GET {{hurlin-await}}{{await1}}
HTTP 200
