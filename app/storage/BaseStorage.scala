package storage

import data.Check

trait BaseStorage[C[_]] {
  def createCheck(check: Check): C[String]
  def getCheck(id: String): C[Check]
  def updateCheck(check: Check): C[Check  ]
  def deleteCheck(check: Check): C[Unit]
}
