package controllers

import data.Check
import javax.inject._
import play.api.mvc._
import services.CheckServiceHashMapImpl
import play.api.libs.mailer._

@Singleton
class HomeController @Inject()(cc: MessagesControllerComponents, checkService: CheckServiceHashMapImpl, emailService: MailerClient)(implicit assetsFinder: AssetsFinder)
  extends MessagesAbstractController(cc) {

  def index = Action {
    Ok(views.html.index(""))
  }

  def openCheck(id: String) = Action { implicit request: MessagesRequest[AnyContent] =>
    checkService.loadCheck(id).fold(
      error => Ok(views.html.checkNotFound(id)),
      check => {
          if (check.closed) {
              Ok(views.html.openClosedCheck(check))
          } else {
              val form = ItemForm.getFilledForm(check)
              Ok(views.html.openCheck(form, check))
          }
      }
    )
  }

  def createCheck() = Action { implicit request: MessagesRequest[AnyContent] =>
    Ok(views.html.createCheck(ItemForm.form))
  }

  def submit() = Action { implicit request =>
    ItemForm.form.bindFromRequest.fold(
      errors => BadRequest(views.html.index(s"Controller error 1: $errors")),
      check => {
        checkService.saveCheck(check).fold(
          error => BadRequest(views.html.index(s"Controller error 2: $error")),
          id => {
            checkService.loadCheck(id).fold(
              err => BadRequest(views.html.index(s"Controller error 3: $err")),
              check => Ok(views.html.afterCheckCreating(check))
            )
          }
        )
      }
    )
  }

  def submitFilled(checkId: String) = Action { implicit request =>
      ItemForm.form.bindFromRequest.fold(
          errors => BadRequest(views.html.index(s"Controller error 1: $errors")),
          checkData => {
              // Здесь и далее предполагается, что этот метод вызывается только после создания одного дополнительного клиента
              val correctedClients = checkData.clients.map(c => c.copy(items =
                  c.items.zip(checkData.items).map(itemPair => {
                      val (clientItem, checkItem) = itemPair
                      clientItem.copy(name = checkItem.name, rate = checkItem.rate)
                  })
              ))
              val correctedCheckData = checkData.copy(clients = correctedClients)
              checkService.updateCheck(correctedCheckData, checkId).fold(
                  error => BadRequest(views.html.index(s"Controller error 2: $error")),
                  check =>
                      checkService.checkIsEmpty(checkId).fold(
                          err => BadRequest(views.html.index(s"Controller error 3: $err")),
                          checkIsEmpty =>
                              if (checkIsEmpty) {
                                  checkService.closeCheck(checkId)
                                  sendLetters(check)
                                  Ok(views.html.checkFinish())
                              }
                              else {
                                  Ok(views.html.checkContinue())
                              }
                      )

              )
          }
      )
  }

    private def sendLetters(check: Check) = {
        val author = check.clients.head
        val clients = check.clients.tail

        val authorEmail = Email(
            "Ваш чек успешно закрыт!",
            "Сервис взаиморасчётов <test@email.com>",
            Seq(s"${author.name} <${author.email}>"),
            Some(
                s"Все позиции из вашего чека ${check.id} были разобраны. Всем участникам в ближайшее время придёт " +
                s"письмо на электронную почту с реквизитами и суммой для оплаты."
            )
        )

        val clientsEmail = clients.map(client => {
            val itemsForPrint = client.items.map(i => s"${i.name} - ${i.quantity} шт. - ${i.cost} руб.").mkString("\n|")
            Email(
                "Нужно внести оплату",
                "Сервис взаиморасчётов <test@email.com>",
                Seq(s"${client.name} <${client.email}>"),
                Some(
                    s"""Здравствуйте, ${client.name}!
                       |
                       |Все позиции из чека ${check.id} были разобраны. Теперь всем участникам необходимо внести оплату.
                       |Список ваших позиций:
                       |$itemsForPrint
                       |
                       |Всего: ${client.totalCost} руб.
                       |
                       |Реквизиты для оплаты:
                       |${check.paymentDetails}
                       |
                       |Хорошего дня!
                    """.stripMargin
                )
            )
        })

        (authorEmail +: clientsEmail).foreach(emailService.send)
    }
}
