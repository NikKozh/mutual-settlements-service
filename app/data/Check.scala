package data

case class Check private (id: String, items: Seq[Item], clients: Seq[Client], paymentDetails: String, closed: Boolean) {
  val totalCost: Double = items.map(_.cost).sum
}

object Check {
  def apply(items: Seq[Item], clients: Seq[Client], paymentDetails: String, closed: Boolean = false): Check =
    new Check(java.util.UUID.randomUUID().toString, items, clients, paymentDetails, closed)
}