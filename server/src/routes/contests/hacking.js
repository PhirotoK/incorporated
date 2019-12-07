const users = require('../../lib/db/users')
const mysql = require('../../lib/mysql')

module.exports = app => {
  app.get('/v1/contests/hacking', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const [[feverContest]] = await mysql.query(
      "SELECT id FROM contests WHERE name='hacking' AND started_at IS NOT NULL AND ended_at IS NULL"
    )
    const [
      feverScoreboards,
    ] = await mysql.query(
      'SELECT user_id, score, rank FROM contests_scoreboards WHERE contest_id=? ORDER BY rank ASC',
      [feverContest.id]
    )
    const hacking = await Promise.all(
      feverScoreboards.map(async feverScore => {
        return {
          score: feverScore.score,
          rank: feverScore.rank,
          user: await users.getData(feverScore.user_id),
        }
      })
    )

    res.json({
      hacking,
    })
  })
}
