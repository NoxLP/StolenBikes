# StolenBikes back-end API

StolenBikes back-end API for Advance Digital Experts challenge.

There's a [folder in google drive](https://drive.google.com/drive/folders/1Crou1Sr6_FYvatt0SJb_8SqgSNmPbn6W?usp=sharing) with some info like data model, endpoints planning, and other things.

I've prepared a public workspce on [postman](https://www.postman.com/noxLP/workspace/stolenbikes/overview) with endpoints and documentation.

For getting the coordinates of the reported stolen bikes I've used [Geoapify](https://www.geoapify.com/), since google geocoding and google maps are not free.

For sending emails I've used [SendGrid](https://sendgrid.com/).

Used [clickup](https://sharing.clickup.com/b/h/6-146688265-2/911957a1ee9e048) as kanban. A screenshot of the original kanban is in the google drive folder.

The production and development databases are uploaded to a MongoDB Atlas account created specifically for this and linked to a google account. I'll pass the login info by email.

## Installation and local run

The API is uploaded to heroku on:

- Development: https://stolen-bikes-challenge-dev.herokuapp.com/api
- Production: https://stolen-bikes-challenge.herokuapp.com/api

Can check the server is running on endpoint `/status`.

Dev and production databases have been created at Mongo Atlas, I'll pass .env files by email.

Also, if you want to run it all locally I've used [run-rs](https://www.npmjs.com/package/run-rs) package, which will download and install a local MongoDB replica set(mongoose transactions need a replica set) independent from any other mongo installation you could have in your computer (won't overwrite a thing). Although I haven't been able to use the seeding script this way, so you'd need to run the seeding script manually once run-rs mongo database is running.

When run in development environment, a npm script will run automatically to seed the database using [mongoose-seed](https://www.npmjs.com/package/mongoose-seed) package before the server start. The script can be run independently with `npm run seed`.

So...

As usual, first:

`npm i`

Then:

### Production Mongo Atlas

1. First time you run the server you'll need to copy `.env` files to `./env` folder.
2. `npm start`

### Development Mongo Atlas

1. First time you run the server you'll need to copy `dev.env` files to `./env` folder.
2. `npm run start:dev`

### Local

1. `npm run start:local`
2. Run-rs can last for a few minutes since it needs to download MongoDB, so wait for it. When it's finished, it will send this message to the console:
   `Started replica set on "mongodb://localhost:27017,localhost:27018,localhost:27019?replicaSet=rs"`
3. First time you run the server locally, run `npm run seed`

<br/>

---

<br/>

## Data Model

<br/>
<br/>

### **Owners Model:**

Bikes owners

| Field         | Type   | Required    | Validation  | Default | Description                                                                              |
| ------------- | ------ | ----------- | ----------- | ------- | ---------------------------------------------------------------------------------------- |
| name          | string | yes         | -           | -       | Owner name                                                                               |
| surname       | string | yes         | -           | -       | Owner surname                                                                            |
| search_names  | string | no          | -           | -       | Owner name + surname n-grams. Text index. Automatically setted on mongoose `pre('save')` |
| email         | string | yes(unique) | email       | -       | Owner auth email                                                                         |
| password      | string | yes         | -           | -       | Owner auth password                                                                      |
| mobile_number | string | yes(unique) | 8-12 digits | -       | Owner mobile number                                                                      |
| address       | string | yes         | -           | -       | Owner address                                                                            |
| bikes         | Array  | no          | -           | -       | Reported bikes - ObjectId: Array - ref: Bikes                                            |
| created_at    | number | no          | -           | -       | Creation timestamp                                                                       |

<br/>

### **Bikes Model:**

Stolen bikes

| Field                  | Type         | Required    | Validation | Default    | Description                                                                                |
| ---------------------- | ------------ | ----------- | ---------- | ---------- | ------------------------------------------------------------------------------------------ |
| date                   | date         | yes         | -          | -          | Bike robbery date                                                                          |
| license_number         | string       | yes(unique) | -          | -          | Bike license number                                                                        |
| owner                  | ObjectId     | yes         | -          | -          | Reporting owner - ref: owners                                                              |
| color                  | string       | yes         | -          | -          | Bike color                                                                                 |
| type                   | string(enum) | no          | -          | other      | Bike type: [ mountain \| road \| other ]                                                   |
| description            | string       | no          | -          | -          | Bike description                                                                           |
| theft_desc             | string       | no          | -          | -          | Theft description                                                                          |
| last_known_address     | string       | yes         | -          | -          | Bike last known address                                                                    |
| last_known_coordinates | GeoJSON      | no          | -          | -          | Bike last known address coordinates fetched from [Geoapify](https://apidocs.geoapify.com/) |
| status                 | string(enum) | no          | -          | unassigned | Bike robbery case status: [ unassigned \| assigned \| solved ]                             |
| officer                | ObjectId     | no          | -          | -          | Officer assigned to solve the case - ref: officers                                         |
| created_at             | number       | no          | -          | -          | Creation timestamp                                                                         |

<br/>
Bikes data transfer objects to list bikes:

<br/>

**Officers search DTO**
| Field | Type | Description |
| --------------- | ------------ | ------------------------------------------------------------------- |
| \_id | ObjectId | Id of original bike |
| license_number | string | Bike license number |
| owner_id | ObjectId | Reporting owner id |
| owner_name | string | Reporting owner name |
| date | date | Bike robbery date |
| status | string(enum) | Bike robbery case status: [ unassigned \| assigned \| solved ] |
| officer_id | ObjectId | Assigned officer id if an officer have been assigned |
| officer_name | string | Assigned officer name if an officer have been assigned |
| department_id | ObjectId | Assigned officer's department id if an officer have been assigned |
| department_name | string | Assigned officer's department name if an officer have been assigned |

<br/>

**Owners search DTO**
| Field | Type | Description |
| --------------- | ------------ | ------------------------------------------------------------------- |
| \_id | ObjectId | Id of original bike |
| status | string(enum) | Bike robbery case status: [ unassigned \| assigned \| solved ] |
| date | date | Bike robbery date |
| license_number | string | Bike license number |

<br/>

### **Police officers model**

Police officers

| Field                 | Type         | Required    | Validation | Default | Description                                                                                |
| --------------------- | ------------ | ----------- | ---------- | ------- | ------------------------------------------------------------------------------------------ |
| name                  | string       | yes         | -          | -       | Officer name                                                                               |
| surname               | string       | yes         | -          | -       | Officer surname                                                                            |
| search_names          | string       | no          | -          | -       | Officer name + surname n-grams. Text index. Automatically setted on mongoose `pre('save')` |
| email                 | string       | yes(unique) | email      | -       | Officer auth email                                                                         |
| password              | string       | yes         | -          | -       | Officer auth password                                                                      |
| police_license_number | string       | yes(unique) | -          | -       | Officer license number                                                                     |
| role                  | string(enum) | no          | -          | regular | Officer role as API user: [ regular \| admin ]                                             |
| bike                  | ObjectId     | no          | -          | -       | Stolen bike case assigned to this officer - ref: bikes                                     |
| department            | ObjectId     | yes         | -          | -       | Officer department - ref: departments                                                      |
| created_at            | number       | no          | -          | -       | Creation timestamp                                                                         |

<br/>

### **Departments model**

Police departments

| Field          | Type         | Required | Validation | Default | Description                                                                                       |
| -------------- | ------------ | -------- | ---------- | ------- | ------------------------------------------------------------------------------------------------- |
| name           | string       | yes      | -          | -       | Department name                                                                                   |
| officers       | Array        | yes      | -          | -       | Officers in this department - ObjectId: Array - ref: officers                                     |
| bike_officers  | Array        | no       | -          | -       | Officers with a bike case assigned in this department - ObjectId: Array - ref: officers           |
| assignments    | string(enum) | yes      | -          | -       | Cases that officers of this departments can be assigned - [ robberies \| crimes \| drugs ]        |
| max_bike_cases | number       | yes      | -          | -       | Maximum number of officers of this department that can have assigned a bike case at the same time |
| created_at     | number       | no       | -          | -       | Creation timestamp                                                                                |

<br/>
<br/>

## API endpoints

All API endpoints prepended with `/api/`

<br/>

### **Auth:**

| METHOD | ENDPOINT             | TOKEN | DESCRIPTION           | POST BODY                                                | PARAMS | QUERY | RETURNS                                                                                               |
| ------ | -------------------- | ----- | --------------------- | -------------------------------------------------------- | ------ | ----- | ----------------------------------------------------------------------------------------------------- |
| POST   | /auth/owners/login   | -     | Owners login          | `email, password`                                        | -      | -     | `token; user: { name, surname, email, mobile_number, address, bikes }`                                |
| POST   | /auth/officers/login | -     | Police officers login | `email, password`                                        | -      | -     | `token; user: { name, surname, email, police_license_number, role, department: {name, assignments} }` |
| POST   | /auth/owners/signup  | -     | Owners signup         | `name, surname, email, password, mobile_number, address` | -      | -     | `token; user: { name, surname, email, mobile_number, address, bikes }`                                |

<br/>

### **Owners:**

| METHOD | ENDPOINT      | TOKEN | DESCRIPTION                          | POST BODY | PARAMS | QUERY | RETURNS                                        |
| ------ | ------------- | ----- | ------------------------------------ | --------- | ------ | ----- | ---------------------------------------------- |
| GET    | /owners/bikes | owner | Get authenticated owner's bikes DTOs | -         | -      | -     | `bikes: [{_id, status, date, license_number}]` |

<br/>

### **Officers:**

| METHOD | ENDPOINT             | TOKEN                | DESCRIPTION                                                                                                                                                                                                                                                                                                                                                                                                                             | POST BODY                                                                           | PARAMS      | QUERY | RETURNS                      |
| ------ | -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------- | ----- | ---------------------------- |
| POST   | /officers            | officer(role: admin) | Create new police officer                                                                                                                                                                                                                                                                                                                                                                                                               | `name, surname, email, password, police_license_number, role(optional), department` | -           | -     | `msg: 'new officer created'` |
| PUT    | /officers/:officerId | officer(role: admin) | Update police officer document. Won't allow to update password or assigned bike. If the department is being updated and the officer have a case assigned, the change will be allowed only if: new department can solve robberies (departments.assignments == 'robberies') AND new department won't pass the maximum bike cases limit (department.max_bike_cases); in any other case it will return a 500 or 400 and won't do the update | Any officer field except for `password` and `bike`                                  | `officerId` | -     | `msg: 'officer updated'`     |

<br/>

### **Bikes:**

| METHOD | ENDPOINT                | TOKEN            | DESCRIPTION                                                                                                                                          | POST BODY                                                                               | PARAMS   | QUERY                                                                                                                              | RETURNS                                                                                                                                                                                                                                                                     |
| ------ | ----------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /bikes/:bikeId          | officer \| owner | Get bike data by id                                                                                                                                  | -                                                                                       | `bikeId` | -                                                                                                                                  | `bike: { _id, type, status, date, license_number, color, theft_desc, last_known_address, owner: { _id, created_at, name, surname, email, mobile_number, address }, officer: { _id, name, surname, email, police_license_number }, department: { _id, name, assignments } }` |
| GET    | /bikes/dtos             | officer          | Search bikes by query params with pagination: `limit` is the number of items per page, `page` the requested page of items)                           | -                                                                                       | -        | `[ limit \| page \| license-number \| color \| type \| owner-name \| owner-surname \| date \| address \| status \| officer-name ]` | Bike DTO                                                                                                                                                                                                                                                                    |
| POST   | /bikes                  | owner            | Report stolen bike                                                                                                                                   | Bike: `date, license_number, coloer, type, description, theft_desc, last_known_address` | -        | -                                                                                                                                  | `msg: 'bike created but NOT assigned'`; Reported bike                                                                                                                                                                                                                       |
| PUT    | /bikes/resolved/:bikeId | officer          | Set bike case as resolved. Automatically search and assign new case to the old assigned officer, if no new case is found, officer is setted as free. | -                                                                                       | `bikeId` | -                                                                                                                                  | `newAssignedBike: [bike \| null]`                                                                                                                                                                                                                                           |

<br/>

### **Departments:**

| METHOD | ENDPOINT                   | TOKEN                 | DESCRIPTION       | POST BODY                           | PARAMS         | QUERY | RETURNS                     |
| ------ | -------------------------- | --------------------- | ----------------- | ----------------------------------- | -------------- | ----- | --------------------------- |
| GET    | /departments/:departmentId | officers              | Get department    | -                                   | `departmentId` | -     | Department                  |
| POST   | /departments               | officers(role: admin) | Create department | `name, assignments, max_bike_cases` | -              | -     | `msg: 'department created'` |
| PUT    | /departments/:departmentId | officers(role: admin) | Update department | `name, assignments, max_bike_cases` | -              | -     | `msg: 'department updated'` |
| DELETE | /departments/:departmentId | officers              | Remove department | -                                   | `departmentId` | -     | `msg: 'department removed'` |
