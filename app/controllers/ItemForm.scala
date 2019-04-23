package controllers

import data.Check
import play.api.data.Forms._
import play.api.data.Form
import play.api.data.format.Formats.doubleFormat

object ItemForm {
  case class CheckData(items: Seq[ItemData], clients: Seq[ClientData], paymentDetailsData: String)
  case class ItemData(name: String, quantity: Int, rate: Double)
    case class ClientData(name: String, email: String, items: Seq[ItemData])
    case class AuthorData(name: String, email: String)

    val form = Form[CheckData](
        mapping(
            "items" ->
                seq(mapping(
                    "name" -> text,
                    "quantity" -> number,
                    "rate" -> of[Double]
                )(ItemData.apply)(ItemData.unapply)),
            "clients" ->
                seq(mapping(
                    "client-name" -> text,
                    "email" -> text,
                    "client-items" ->
                        seq(mapping(
                            "name" -> text,
                            "client-quantity" -> number,
                            "rate" -> ignored(0.0)
                        )(ItemData.apply)(ItemData.unapply))
                )(ClientData.apply)(ClientData.unapply)),
            "payment-details" -> text
        )(CheckData.apply)(CheckData.unapply)
    )

    def getFilledForm(check: Check): Form[CheckData] = {
        val itemsData = check.items.map(i => ItemData(i.name, i.quantity, i.rate))
        val clientsData = check.clients.map(c =>
            ClientData(c.name, c.email, c.items.map(i => ItemData(i.name, i.quantity, i.rate)))
        )
        form.fill(CheckData(itemsData, clientsData, check.paymentDetails))
    }
}