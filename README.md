# Telegram Cloud Storage

How to run:

- Create a telegram bot
- Add domain to telegram bot, i.e. `yourdomain.com`
- Add `yourdomain.com 127.0.0.1` to `/etc/hosts/` 
- Rename `example.env` to `.env` ad write your variables
- Add first user to the `users` collection based on the [model](./src/db/models.js#L05)
- run `yarn`
- run `yarn start`
- open `yourdomain.com` in a browser
