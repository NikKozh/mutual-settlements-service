function deleteIndex(e) {
    var rowList = document.getElementsByClassName('item-row');
    if (rowList.length === 1) {
        // alert("Can't delete last row!");
    } else {
        var currentRow = e.target.closest(".item-row");
        currentRow.parentNode.removeChild(currentRow);
        recalculateIndices();
    }
}

function addItem(e) {
    var rowList = document.getElementsByClassName('item-row');
    var lastItemRow = rowList[rowList.length - 1];
    var lastItemRowCopy = lastItemRow.cloneNode(true);

    var newName = lastItemRowCopy.querySelector(".name input");
    var newQuantity = lastItemRowCopy.querySelector(".quantity input");
    var newRate = lastItemRowCopy.querySelector(".rate input");

    newName.value = "";
    newQuantity.value = "";
    newRate.value = "";
    lastItemRowCopy.querySelector(".cost").innerHTML = "0.00 руб.";

    newQuantity.addEventListener('input', recalculateCost);
    newRate.addEventListener('input', recalculateCost);
    lastItemRowCopy.querySelector(".deleteItem").addEventListener('click', deleteIndex);

    var lastInvisibleRow = document.getElementById("last-row");
    document.getElementById("check-form").insertBefore(lastItemRowCopy, lastInvisibleRow);
    recalculateIndices();
}

function recalculateIndices() {
    var itemRowList = document.getElementsByClassName("item-row");
    for (var i = 0; i < itemRowList.length; i++) {
        var itemName = itemRowList[i].querySelector(".name input");
        var itemQuantity = itemRowList[i].querySelector(".quantity input");
        var itemRate = itemRowList[i].querySelector(".rate input");

        itemName.id = "items_" + i + "_name";
        itemName.name = "items[" + i + "].name";

        itemQuantity.id = "items_" + i + "_quantity";
        itemQuantity.name = "items[" + i + "].quantity";

        itemRate.id = "items_" + i + "_rate";
        itemRate.name = "items[" + i + "].rate";
    }

    var costList = document.getElementsByClassName("cost");
    var totalCost = document.getElementById("total-cost");
    var accum = 0;
    for (var i = 0; i < costList.length; ++i) {
        accum += parseFloat(costList[i].innerHTML);
    }
    totalCost.innerHTML = accum.toFixed(2) + " руб.";

    var clientCostList = document.getElementsByClassName("client-cost");
    var clientTotalCost = document.getElementById("client-total-cost");
    accum = 0;
    for (i = 0; i < clientCostList.length; ++i) {
        accum += parseFloat(clientCostList[i].innerHTML);
    }
    clientTotalCost.innerHTML = accum.toFixed(2) + " руб.";
}

function recalculateCost(e) {
    var closestRow = e.target.closest(".item-row");
    var sameItemQuantity = (!document.getElementById("client-wrapper")) ?
        parseInt(closestRow.querySelector(".quantity input").value) :
        parseInt(closestRow.querySelector(".client-quantity input").value);
    var sameItemRate = parseFloat(closestRow.querySelector(".rate input").value);
    var sameItemCost = (!document.getElementById("client-wrapper")) ?
        closestRow.querySelector(".cost") :
        closestRow.querySelector(".client-cost");
    sameItemCost.innerHTML = ((isNaN(sameItemQuantity) || isNaN(sameItemRate)) ? "0.00" : (sameItemQuantity * sameItemRate).toFixed(2)) + " руб.";

    var costList = document.getElementsByClassName("cost");
    var totalCost = document.getElementById("total-cost");
    var accum = 0;
    for (var i = 0; i < costList.length; ++i) {
        accum += parseFloat(costList[i].innerHTML);
    }
    totalCost.innerHTML = accum.toFixed(2) + " руб.";

    var clientCostList = document.getElementsByClassName("client-cost");
    var clientTotalCost = document.getElementById("client-total-cost");
    accum = 0;
    for (i = 0; i < clientCostList.length; ++i) {
        accum += parseFloat(clientCostList[i].innerHTML);
    }
    clientTotalCost.innerHTML = accum.toFixed(2) + " руб.";
}

function increaseQuantity(e) {
    var closestRow = e.target.closest(".item-row");
    var generalQuantity = parseInt(closestRow.querySelector(".quantity input").value);
    var clientQuantity = parseInt(closestRow.querySelector(".client-quantity input").value);
    if (clientQuantity < generalQuantity) {
        closestRow.querySelector(".client-quantity input").value = ++clientQuantity;
        var sameItemRate = parseFloat(closestRow.querySelector(".rate input").value);
        closestRow.getElementsByClassName("client-cost")[0].innerHTML = ((isNaN(clientQuantity) || isNaN(sameItemRate)) ? "0.00" : (clientQuantity * sameItemRate).toFixed(2)) + " руб.";

        var costList = document.getElementsByClassName("cost");
        var totalCost = document.getElementById("total-cost");
        var accum = 0;
        for (var i = 0; i < costList.length; ++i) {
            accum += parseFloat(costList[i].innerHTML);
        }
        totalCost.innerHTML = accum.toFixed(2) + " руб.";

        var clientCostList = document.getElementsByClassName("client-cost");
        var clientTotalCost = document.getElementById("client-total-cost");
        accum = 0;
        for (i = 0; i < clientCostList.length; ++i) {
            accum += parseFloat(clientCostList[i].innerHTML);
        }
        clientTotalCost.innerHTML = accum.toFixed(2) + " руб.";
    }
}

function decreaseQuantity(e) {
    var closestRow = e.target.closest(".item-row");
    var clientQuantity = parseInt(closestRow.querySelector(".client-quantity input").value);
    if (clientQuantity > 0) {
        closestRow.querySelector(".client-quantity input").value = --clientQuantity;
        var sameItemRate = parseFloat(closestRow.querySelector(".rate input").value);
        closestRow.getElementsByClassName("client-cost")[0].innerHTML = ((isNaN(clientQuantity) || isNaN(sameItemRate)) ? "0.00" : (clientQuantity * sameItemRate).toFixed(2)) + " руб.";

        var costList = document.getElementsByClassName("cost");
        var totalCost = document.getElementById("total-cost");
        var accum = 0;
        for (var i = 0; i < costList.length; ++i) {
            accum += parseFloat(costList[i].innerHTML);
        }
        totalCost.innerHTML = accum.toFixed(2) + " руб.";

        var clientCostList = document.getElementsByClassName("client-cost");
        var clientTotalCost = document.getElementById("client-total-cost");
        accum = 0;
        for (i = 0; i < clientCostList.length; ++i) {
            accum += parseFloat(clientCostList[i].innerHTML);
        }
        clientTotalCost.innerHTML = accum.toFixed(2) + " руб.";
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById("client-wrapper")) {

        var deleteButtonsList = document.getElementsByClassName('deleteItem');
        for (var i = 0; i < deleteButtonsList.length; i++) {
            deleteButtonsList[i].addEventListener('click', deleteIndex);
        }

        document.getElementById('addItem').addEventListener('click', addItem);

        /*var costLabelList = document.getElementsByClassName("cost");
        for (i = 0; i < costLabelList.length; i++) {
            var closestRow = costLabelList[i].closest(".item-row");
            var sameItemQuantity = parseInt(closestRow.querySelector(".quantity input").value);
            var sameItemRate = parseFloat(closestRow.querySelector(".rate input").value);
            costLabelList[i].innerHTML = ((isNaN(sameItemQuantity) || isNaN(sameItemRate)) ? "0.00" : (sameItemQuantity * sameItemRate).toFixed(2)) + " руб.";
        }*/

        var quantityList = document.getElementsByClassName("quantity");
        var rateList = document.getElementsByClassName("rate");
        for (i = 0; i < quantityList.length; i++) {
            quantityList[i].getElementsByTagName("input")[0].addEventListener('input', recalculateCost);
            rateList[i].getElementsByTagName("input")[0].addEventListener('input', recalculateCost);
        }

    } else {
        var clientCostLabelList = document.getElementsByClassName("client-cost");
        for (i = 0; i < clientCostLabelList.length; i++) {
            var closestRow = clientCostLabelList[i].closest(".item-row");
            var sameItemQuantity = parseInt(closestRow.querySelector(".client-quantity input").value);
            var sameItemRate = parseFloat(closestRow.querySelector(".rate input").value);
            clientCostLabelList[i].innerHTML = ((isNaN(sameItemQuantity) || isNaN(sameItemRate)) ? "0.00" : (sameItemQuantity * sameItemRate).toFixed(2)) + " руб.";
        }

        var quantityList = document.getElementsByClassName("client-quantity");
        for (i = 0; i < quantityList.length; i++) {
            var quantityInput = quantityList[i].querySelector("input");
            quantityInput.addEventListener('input', recalculateCost);
            if (!quantityInput.value) {
                quantityInput.value = "0";
            }
        }

        var increaseButtonList = document.getElementsByClassName("addItem");
        var decreaseButtonList = document.getElementsByClassName("removeItem");
        for (i = 0; i < increaseButtonList.length; i++) {
            increaseButtonList[i].addEventListener('click', increaseQuantity);
            decreaseButtonList[i].addEventListener('click', decreaseQuantity);
        }
    }

    var costLabelList = document.getElementsByClassName("cost");
    for (i = 0; i < costLabelList.length; i++) {
        var closestRow = costLabelList[i].closest(".item-row");
        var sameItemQuantity = parseInt(closestRow.querySelector(".quantity input").value);
        var sameItemRate = parseFloat(closestRow.querySelector(".rate input").value);
        costLabelList[i].innerHTML = ((isNaN(sameItemQuantity) || isNaN(sameItemRate)) ? "0.00" : (sameItemQuantity * sameItemRate).toFixed(2)) + " руб.";
    }

    var costList = document.getElementsByClassName("cost");
    var totalCost = document.getElementById("total-cost");
    var accum = 0.0;
    for (i = 0; i < costList.length; ++i) {
        accum += parseFloat(costList[i].innerHTML);
    }
    totalCost.innerHTML = accum.toFixed(2) + " руб.";

    var clientCostList = document.getElementsByClassName("client-cost");
    var clientTotalCost = document.getElementById("client-total-cost");
    accum = 0;
    for (i = 0; i < clientCostList.length; ++i) {
        accum += parseFloat(clientCostList[i].innerHTML);
    }
    clientTotalCost.innerHTML = accum.toFixed(2) + " руб.";
});