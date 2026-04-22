package com.grocery.scanner

data class Product(
    val barcode: String,
    val name: String,
    val price: Double,
    val category: String?,
    val description: String? = null
)
