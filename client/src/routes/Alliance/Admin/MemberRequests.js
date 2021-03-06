import React, { useState, useCallback, useEffect } from 'react'
import api from '../../../lib/api'
import PropTypes from 'prop-types'

MemberRequests.propTypes = {
  reloadAllianceData: PropTypes.func.isRequired,
}

export default function MemberRequests({ reloadAllianceData }) {
  const [memberRequests, setMemberRequests] = useState(null)

  const reloadMemberRequests = useCallback(() => {
    api
      .get('/v1/alliance/member_request/list')
      .then(res => {
        setMemberRequests(res.member_requests)
      })
      .catch(err => alert(err.message))
  }, [])

  useEffect(() => {
    reloadMemberRequests()
  }, [reloadMemberRequests])

  const memberRequestAction = (action, memberRequest) => () => {
    api
      .post(`/v1/alliance/member_request/${action}`, { user_id: memberRequest.id })
      .then(() => {
        reloadMemberRequests()
        if (action === 'accept') reloadAllianceData()
      })
      .catch(err => alert(err.message))
  }

  return (
    <div>
      <table>
        <tbody>
          {memberRequests &&
            memberRequests.map(memberRequest => {
              return (
                <tr key={memberRequest.id}>
                  <td>{memberRequest.username}</td>
                  <td>
                    <button onClick={memberRequestAction('reject', memberRequest)}>Rechazar</button>
                    <button onClick={memberRequestAction('accept', memberRequest)}>Aceptar</button>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
