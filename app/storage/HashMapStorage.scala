package storage

import data.Check
import javax.inject.Singleton

import scala.collection.mutable
import scala.util.Try

@Singleton
class HashMapStorage extends BaseStorage[Try] {
  private val storage: mutable.HashMap[String, Check] = mutable.HashMap.empty

  def createCheck(check: Check): Try[String] = Try {
    if (storage.exists(check.id == _._1))
      sys.error(s"storage error: created check with id ${check.id} already exist!")
    else {
        storage.update(check.id, check)
        check.id
    }
  }

  def getCheck(id: String): Try[Check] = Try {
    storage.getOrElse(id, sys.error(s"storage error: trying to get check with id $id that doesn't exist!"))
  }

  def updateCheck(check: Check): Try[Check] = Try {
    if (!storage.exists(check.id == _._1))
      sys.error(s"storage error: trying to update check with id ${check.id} that doesn't exist yet!")
    else
      storage.update(check.id, check)
      check
  }

  def deleteCheck(check: Check): Try[Unit] = Try {
    if (storage.exists(check.id == _._1))
      storage.remove(check.id)
    else
      sys.error(s"storage error: trying to delete check with id ${check.id} that doesn't exist!")
  }
}
