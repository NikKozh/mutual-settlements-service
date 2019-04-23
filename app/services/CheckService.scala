package services

import controllers.ItemForm.CheckData
import data.{Check, Client, Item}
import javax.inject.{Inject, Singleton}
import storage.HashMapStorage

import scala.util.Try

trait CheckService[C[_]] {
  def saveCheck(check: CheckData): C[String]
  def loadCheck(id: String): C[Check]
  def updateCheck(check: CheckData, checkId: String): C[Check]
    def makeCheckEntity(data: CheckData, id: Option[String] = None): Check
    def checkIsEmpty(id: String): Try[Boolean]
    def closeCheck(id: String): Try[Check]
}

@Singleton
class CheckServiceHashMapImpl @Inject()(storage: HashMapStorage) extends CheckService[Try] {
    override def makeCheckEntity(data: CheckData, id: Option[String] = None): Check = {
        val items = data.items.map(i => Item(i.name, i.quantity, i.rate))
        val clients = data.clients.map(c => Client(c.name, c.email))
        id.fold(
            Check(items, clients, data.paymentDetailsData)
        )(
            Check(_, items, clients, data.paymentDetailsData, closed = false)
        )
    }

  override def saveCheck(check: CheckData): Try[String] = {
    storage.createCheck(makeCheckEntity(check))
  }

  override def loadCheck(id: String): Try[Check] = {
    storage.getCheck(id)
  }

    // Вызывать этот метод только в том случае, если перед этим в чек был добавлен один новый клиент
    override def updateCheck(check: CheckData, checkId: String): Try[Check] = {
        loadCheck(checkId).flatMap(oldCheck => {
            val lastClientItems = check.clients.last.items.map(i => Item(i.name, i.quantity, i.rate))
            val updatedItems = oldCheck.items.zip(lastClientItems).map(itemPair => {
                val (checkItem, clientItem) = itemPair
                checkItem.copy(quantity = checkItem.quantity - clientItem.quantity)
            })
            val lastClientData = check.clients.last
            val lastClient = Client(lastClientData.name, lastClientData.email, lastClientData.items.map(i => Item(i.name, i.quantity, i.rate)))

            storage.updateCheck(Check(checkId, updatedItems, oldCheck.clients :+ lastClient, check.paymentDetailsData, closed = false))
        })
    }

    override def checkIsEmpty(id: String): Try[Boolean] = {
        loadCheck(id).map(check => check.items.forall(_.quantity <= 0))
    }

    override def closeCheck(id: String): Try[Check] = {
        loadCheck(id).flatMap(check => storage.updateCheck(check.copy(closed = true)))
    }
}