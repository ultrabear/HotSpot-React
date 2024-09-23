# CSRF
GET {{url}}/api/csrf/restore
HTTP 200
[Captures]
csrf_token: jsonpath "$['XSRF-Token']"


GET {{url}}/api/spots
XSRF-Token: {{csrf_token}}
HTTP 200
[Asserts]
jsonpath "$.Spots" exists
jsonpath "$.Spots[0].name" exists
jsonpath "$.Spots[0].id" exists
jsonpath "$.Spots[0].ownerId" exists
jsonpath "$.Spots[0].address" exists
jsonpath "$.Spots[0].city" exists
jsonpath "$.Spots[0].state" exists
jsonpath "$.Spots[0].country" exists
jsonpath "$.Spots[0].lat" exists
jsonpath "$.Spots[0].lng" exists
jsonpath "$.Spots[0].description" exists
jsonpath "$.Spots[0].price" exists
jsonpath "$.Spots[0].createdAt" exists
jsonpath "$.Spots[0].updatedAt" exists
jsonpath "$.Spots[0].avgRating" exists
jsonpath "$.Spots[0].previewImage" exists


POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "landowner@evil.inc",
  "password": "eggs-and-bacon"
}
HTTP 200


GET {{url}}/api/spots/current
XSRF-Token: {{csrf_token}}
HTTP 200
[Asserts]
jsonpath "$.Spots" exists
jsonpath "$.Spots[0].name" contains "Cabin"
jsonpath "$.Spots[0].id" exists
jsonpath "$.Spots[0].ownerId" exists
jsonpath "$.Spots[0].address" exists
jsonpath "$.Spots[0].city" exists
jsonpath "$.Spots[0].state" exists
jsonpath "$.Spots[0].country" exists
jsonpath "$.Spots[0].lat" exists
jsonpath "$.Spots[0].lng" exists
jsonpath "$.Spots[0].description" exists
jsonpath "$.Spots[0].price" exists
jsonpath "$.Spots[0].createdAt" exists
jsonpath "$.Spots[0].updatedAt" exists
jsonpath "$.Spots[0].avgRating" exists
jsonpath "$.Spots[0].previewImage" exists
