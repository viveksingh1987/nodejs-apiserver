import { createServer } from "./utils/server";

createServer().then(server => server.listen(3000, ()=> console.info('Listening on 30000'))).catch(err=> console.error)