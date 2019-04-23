package data

case class Client private (id: String, name: String, email: String, items: Seq[Item]) {
    val totalCost: Double = items.map(_.cost).sum
}

object Client {
  def apply(name: String, email: String, items: Seq[Item] = Seq.empty): Client =
    new Client(java.util.UUID.randomUUID().toString, name, email, items)
}