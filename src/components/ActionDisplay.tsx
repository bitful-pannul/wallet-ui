import Col from "./spacing/Col"
import Row from "./spacing/Row"
import { TransactionArgs } from "../types/Transaction"

interface ActionDisplayProps {
  action: string | TransactionArgs
  hideDetails?: boolean
}

export const ActionDisplay = ({ action, hideDetails = false }: ActionDisplayProps) => {
  if (typeof action === 'string') {
    return <Row>Action: {action}</Row>
  }

  const actionTitle = Object.keys(action || {})[0] || 'unknown'

  return (
    <Col style={{ maxHeight: '50vh', overflow: 'auto' }}>
      <Row>
        <Row style={{ fontWeight: 'bold' }}>Action:</Row>
        <Row style={{ marginLeft: 8 }}>{actionTitle}</Row>
      </Row>
      {Boolean(action && action[actionTitle] && !hideDetails) && Object.keys(action[actionTitle]).map(field => (
        <Col style={{ marginLeft: 8 }} key={field}>
          <Row style={{ fontWeight: 'bold' }}>{field}:</Row>
          <Row style={{ wordBreak: 'break-word' }}>{action[actionTitle][field]}</Row>
        </Col>
      ))}
    </Col>
  )
}
