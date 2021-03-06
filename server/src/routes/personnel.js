const mysql = require('../lib/mysql')
const personnel = require('../lib/db/personnel')
const { personnelList } = require('shared-lib/personnelUtils')

const handlePersonnelRequest = async (req, res, operationType) => {
  if (!req.userData) {
    res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
    return
  }
  if (!req.body.amount || !req.body.resource_id) {
    res.status(400).json({ error: 'Faltan datos' })
    return
  }

  const resourceAmount = parseInt(req.body.amount)
  const resourceID = req.body.resource_id

  if (!personnelList.find(b => b.resource_id === resourceID)) {
    res.status(400).json({ error: 'Invalid resource_id' })
    return
  }

  if (resourceAmount < 1) {
    res.status(400).json({ error: 'Invalid resource amount' })
    return
  }

  let price
  switch (operationType) {
    case 'hire':
      price = personnelList.find(resources => resources.resource_id === resourceID).price * resourceAmount
      break
    case 'fire':
      if (req.userData.personnel[resourceID] < resourceAmount) {
        res.status(400).json({ error: 'No tienes suficiente personal' })
        return
      }
      price = personnelList.find(resources => resources.resource_id === resourceID).firingCost * resourceAmount
      break
    default:
      res.status(500).json({ error: 'No implementado' })
      return
  }

  if (price > req.userData.money) {
    res.status(400).json({ error: 'No tienes suficiente dinero' })
    return
  }

  req.userData.money -= price
  await mysql.query('UPDATE users SET money=money-? WHERE id=?', [price, req.userData.id])
  await personnel.updatePersonnelAmount(req, resourceID, resourceAmount * (operationType === 'fire' ? -1 : 1))

  res.json({
    success: true,
  })
}

module.exports = app => {
  app.post('/v1/personnel/hire', async function(req, res) {
    handlePersonnelRequest(req, res, 'hire')
  })

  app.post('/v1/personnel/fire', async function(req, res) {
    handlePersonnelRequest(req, res, 'fire')
  })
}
