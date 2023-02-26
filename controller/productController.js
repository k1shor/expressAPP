const Product = require('../model/productModel')

// to add new product
exports.addProduct = async(req, res) => {
    if(!req.file){
        return res.status(400).json({error:"File not selected"})
    }
    let productToAdd = new Product({
        product_name: req.body.product_name,
        product_price: req.body.product_price,
        product_description: req.body.product_description,
        product_image: req.file.path,
        count_in_stock: req.body.count_in_stock,
        category: req.body.category
    })
    productToAdd = await productToAdd.save()
    if(!productToAdd){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(productToAdd)
}

// to get product details
exports.productDetail = async (req, res) => {
    let product = await Product.findById(req.params.id).populate('category')
    if(!product){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(product)
}

// to view product list
exports.getAllProducts = async (req, res) => {
    let products = await Product.find()
    .populate('category','category_name')
    .sort([['createdAt','desc']])
    // .limit(3)
    if(!products){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(products)
}

// to get product list of particular category
exports.getProductsByCategory = async (req, res) => {
    let products = await Product.find({category: req.params.category_id})
    // .select(['-rating'])
    if(!products){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(products)
}

// to update product
exports.updateProduct = async (req, res) => {
    console.log(req.body)
    let productToUpdate = await Product.findByIdAndUpdate(req.params.id,
        req.file? 
        {
        product_name: req.body.product_name,
        product_price: req.body.product_price,
        product_description: req.body.product_description,
        product_image: req.file.path,
        count_in_stock: req.body.count_in_stock,
        category: req.body.category,
        rating: req.body.rating
    }:
    {
        product_name: req.body.product_name,
        product_price: req.body.product_price,
        product_description: req.body.product_description,
        count_in_stock: req.body.count_in_stock,
        category: req.body.category,
        rating: req.body.rating
    }
    ,{new:true})
    if(!productToUpdate){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(productToUpdate)
}

// to delete product
exports.deleteProduct = (req, res) => {
    Product.findByIdAndRemove(req.params.id)
    .then(product=>{
        if(!product){
            return res.status(400).json({error:"Product not found"})
        }
        return res.status(200).json({message:"Product deleted successfully"})
    })
    .catch(error=>{
        return res.status(400).json({error:error.message})
    })
}

// to get filtered products
exports.getFilteredProduct = async (req, res) => {
    let sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt'
    let order = req.query.order ? req.query.order : '1'
    // 1, asc, ascending - ascending , 0, desc, descending - descending
    let limit = req.query.limit ? Number(req.query.limit) : 9999999
    let Args = {}
    for(key in req.body.filter){
        if(req.body.filter[key].length>0){
            if(key === 'product_price'){
                Args[key]= {
                    $gte: req.body.filter[key][0],
                    $lte: req.body.filter[key][1]
                }
            }
            else{
                Args[key] = req.body.filter[key]
            }
        }
    }
    let filteredProducts = await Product.find(Args).populate('category').sort([[sortBy,order]]).limit(limit)
    if(!filteredProducts){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(filteredProducts)
}

/* filter : {
    product_price: [1000, 9999],
    category: ['abc', 'deff', 'jkl']
}


*/