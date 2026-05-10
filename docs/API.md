# CAMPUS-BANDHU API Surface (`/api/v1`)

## Public

- `GET /health`
- `GET /events`
- `GET /events/:id`
- `GET /feed`
- `GET /marketplace`
- `GET /profiles/:id`
- `GET /recruiters/opportunities`

## Auth Required

- `POST /events`
- `POST /events/:id/register`
- `POST /feed`
- `POST /feed/:id/like`
- `POST /marketplace`
- `PATCH /marketplace/:id/sold`
- `GET /profiles/me`
- `PUT /profiles/me`
- `POST /profiles/me/skills`
- `POST /recruiters/opportunities`
- `POST /recommendations/personalized`
- `GET /achievements/student/:studentId`
- `POST /achievements/mint`

