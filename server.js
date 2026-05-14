import app from './api/app.js'

const PORT = process.env.API_PORT || 3001

app.listen(PORT, () => {
  console.log(`API ?쒕쾭 ?ㅽ뻾 以? http://localhost:${PORT}`)
})
