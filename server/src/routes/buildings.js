const mysql = require('../lib/mysql')
const { buildingsList, calcBuildingPrice } = require('shared-lib/buildingsUtils')

module.exports = app => {
  app.get('/v1/buildings', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const buildings = {}
    buildingsList.forEach(building => (buildings[building.id] = 0))

    const [buildingsRaw] = await mysql.query('SELECT id, quantity FROM buildings WHERE user_id=?', [req.userData.id])
    if (buildingsRaw) buildingsRaw.forEach(building => (buildings[building.id] = building.quantity))

    res.json({
      buildings,
    })
  })

  app.post('/v1/buy_buildings', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    if (!req.body.building_id || !req.body.count) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }
    const buildingID = req.body.building_id
    const count = 1 // TODO: Use req.body.count
    if (count > 1) throw new Error('Not implemented yet')

    const buildingInfo = buildingsList.find(b => b.id === buildingID)
    if (!buildingInfo) {
      res.status(400).json({ error: 'Invalid building_id' })
      return
    }

    const currentOptimizeLvl = req.userData.researchs[5]
    const hasEnoughOptimizeLvl = currentOptimizeLvl >= buildingInfo.requiredOptimizeResearchLevel
    if (!hasEnoughOptimizeLvl) {
      res.status(400).json({ error: 'No tienes suficiente nivel de oficina central' })
      return
    }

    const [[building]] = await mysql.query('SELECT quantity FROM buildings WHERE user_id=? and id=?', [
      req.userData.id,
      buildingID,
    ])
    const price = calcBuildingPrice(buildingID, building ? building.quantity : 0)
    if (price > req.userData.money) {
      res.status(400).json({ error: 'No tienes suficiente dinero' })
      return
    }

    req.userData.money -= price
    await mysql.query('UPDATE users SET money=money-? WHERE id=?', [price, req.userData.id])

    if (!building) {
      await mysql.query('INSERT INTO buildings (user_id, id, quantity) VALUES (?, ?, ?)', [
        req.userData.id,
        buildingID,
        1,
      ])
    } else {
      await mysql.query('UPDATE buildings SET quantity=quantity+? WHERE user_id=? and id=?', [
        1,
        req.userData.id,
        buildingID,
      ])
    }

    res.json({
      success: true,
    })
  })
}
