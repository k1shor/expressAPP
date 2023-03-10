const Category = require('../model/categoryModel')

// to create new category
exports.addCategory = async (req, res) => {
    let category = await Category.findOne({category_name: req.body.category_name})
    if(!category){
        let categoryToAdd = new Category({
            category_name: req.body.category_name
        })
        categoryToAdd = await categoryToAdd.save()
        if(!categoryToAdd){
            return res.status(400).json({error:"Something went wrong"})
        }
        return res.send(categoryToAdd)
    }
    res.status(400).json({error:"Category already exists."})
}

// to get all categories
exports.getAllCategories = async (req, res) => {
    let categories = await Category.find()
    if(!categories){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(categories)
}

// to get category details
exports.categoryDetails = async (req, res) => {
    let category = await Category.findById(req.params.id)
    if(!category){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(category)
}

// to update category
exports.updateCategory = async (req, res) => {
    let categoryToUpdate = await Category.findByIdAndUpdate(req.params.id,{
        category_name: req.body.category_name
    }, {new:true})
    if(!categoryToUpdate){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(categoryToUpdate)
}

// delete category using callback
// exports.deleteCategory = (req,res) => {
//     Category.findByIdAndDelete(req.params.id, (request,data)=>{
//         if(!data){
//             return res.status(400).json({error:"Category not found"})
//         }
//         res.send({msg:"category deleted successfully"})
//     })
// }


// delete category using promise(.then)
// exports.deleteCategory = (req,res) => {
//     Category.findByIdAndDelete(req.params.id)
//     .then(category=>{
//         if(!category){
//             return res.status(400).json({error:"Category not found"})
//         }
//         res.status(200).json({msg:"Category deleted successfully"})
//     })
//     .catch(error=>res.status(400).json({error:error.message}))
// }

// delete category using async await
exports.deleteCategory = async (req, res) => {
    try{
        let categoryToDelete = await Category.findByIdAndRemove(req.params.id)
        if(!categoryToDelete){
            return res.status(400).json({error:"Category not found"})
        }
        res.status(200).json({msg:"Category deleted successfully"})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}





/*
find() - returns all data
find(filter) - returns all data that matches the filter object
findOne(filter) - returns first data that matches the filter object
findById(id) -returns data that has the id
findByIdAndUpdate(id, {obj} ,options) -> finds the data with the id and updates with the obj 
findByIdAndRemove(id) or findByIdAndDelete(id) -> finds the data with the id and deletes
*/

// req.body -> value passed using form
// req.params -> value passed using url : facebook.com/kishor
// req.query -> value passed through url using variables: search/adfdsf&query=value

// res.send -> object
// res.json -> json object
// status(200) -> success
// 400 -> bad request error
// 404 -> error