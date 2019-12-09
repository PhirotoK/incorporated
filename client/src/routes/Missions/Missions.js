import React, { useState, useEffect, useCallback } from 'react'
import Username from '../../components/Username'
import { Switch, Route, NavLink } from 'react-router-dom'
import api from '../../lib/api'
import './Missions.scss'
import { timestampFromEpoch } from 'shared-lib/commonUtils'
import Mission from './Mission'
import ActiveMission from './ActiveMission'

export default function Missions() {
  const [missions, setMissions] = useState([])
  const activeMissions = missions.filter(m => !m.completed)

  const reloadMissionsCallback = useCallback(() => {
    api
      .get('/v1/missions')
      .then(res => {
        setMissions(res.missions)
      })
      .catch(err => alert(err.message))
  }, [])

  useEffect(() => reloadMissionsCallback(), [reloadMissionsCallback])

  return (
    <div>
      <nav className="sub-menu">
        <ul>
          <li>
            <NavLink to="/missions/attack">Atacar</NavLink>
          </li>
          <li>
            <NavLink to="/missions/hack">Hackear</NavLink>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/missions/:missionType/:username?">
          <Mission reloadMissionsCallback={reloadMissionsCallback} />
        </Route>
      </Switch>
      <h2>Active missions</h2>
      <table>
        <thead>
          <tr>
            <th>Tipo de misión</th>
            <th>Usuario objetivo</th>
            <th>Tropas enviadas</th>
            <th>Edificio objetivo</th>
            <th>Fecha de finalización</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activeMissions.length ? (
            activeMissions.map((mission, i) => (
              <ActiveMission key={i} mission={mission} reloadMissionsCallback={reloadMissionsCallback} />
            ))
          ) : (
            <tr>
              <td colSpan="3">No hay misiones activas</td>
            </tr>
          )}
        </tbody>
      </table>
      <hr />
      <h2>Completed missions</h2>
      <table>
        <thead>
          <tr>
            <th>Tipo de misión</th>
            <th>Usuario objetivo</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {missions.filter(m => m.completed).length ? (
            missions
              .filter(m => m.completed)
              .map((m, i) => (
                <tr key={i}>
                  <td>{m.mission_type}</td>
                  <td>
                    <Username user={m.target_user} />
                  </td>
                  <td>{timestampFromEpoch(m.will_finish_at)}</td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="3">No has realizado ninguna misión todavía</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
