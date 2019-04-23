package data

case class Item(name: String, quantity: Int, rate: Double) {
  val cost: Double = quantity * rate
}