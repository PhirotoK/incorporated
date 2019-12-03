const mysql = require('../lib/mysql')
const frequencyMs = 15 * 1000 // Every 15s for dev purposes
const { getUserDailyIncome } = require('../lib/db/users')
const { timestampFromEpoch } = require('shared-lib/commonUtils')

const setUserIncome = async (userID, userIncome, rank) => {
  const [[rowExists]] = await mysql.query('SELECT 1 FROM ranking WHERE user_id = ?', [userID])
  if (!rowExists) {
    await mysql.query('INSERT INTO ranking (user_id, income, rank) VALUES (?, ?, ?)', [userID, userIncome, rank])
  } else {
    await mysql.query('UPDATE ranking SET income=?,rank=? WHERE user_id=?', [userIncome, rank, userID])
  }
}

const run = async () => {
  console.log(`${timestampFromEpoch()} Running update ranking CRON`)
  const [users] = await mysql.query('SELECT id FROM users')
  const parsedUsers = await Promise.all(
    users.map(async user => {
      // Fetch the user's buildings
      const userTotalIncome = await getUserDailyIncome(user.id, { withoutExpensesOrTaxes: true })

      return {
        id: user.id,
        income: userTotalIncome,
      }
    })
  )

  await Promise.all(
    parsedUsers
      .sort((a, b) => (a.income < b.income ? 1 : -1))
      .map((user, index) => {
        setUserIncome(user.id, user.income, index + 1)
      })
  )
}

module.exports = {
  run,
  frequencyMs,
}
