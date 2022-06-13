(async () => {
    const express = require('express')
    const app = express()
    const db = require("./db.js")
    const url = require("url")
    const boyParser = require("body-parser")
    const session = require("express-session")
    const port = 8080

    app.set("view engine", "ejs")



    const dia = 1000 * 60 * 60 * 24;
    const min15 = 1000 * 60 * 60 / 4;

app.use(session({
    secret: "hrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: dia},
    resave: false 
}))

    //config para as variaveis post
    app.use(boyParser.urlencoded({ extended: false }))
    app.use(boyParser.json())


    app.use(express.static('livraria-2022'))
    app.use("/books", express.static("books"))
    app.use("/imgs", express.static("imgs"))
    app.use("/css", express.static("css"))
    app.use("/js", express.static("js"))
    //app.use("/adm",express.static("adm")) 


    const consulta = await db.selectFilmes()
    const consultaLivro = await db.selectLivros()

    //console.log(consulta[0])
    //console.log(consultaLivro[0])


    app.post("/login",async(req,res)=>{
        let info=req.body
        let consultaUsers = await db.selectUsers(info.email,info.senha)
        consultaUsers == "" ? res.send("Usuário não encontrado!") : res.redirect("/")
        const session_user=req.session
        consultaUsers != "" ? session_user = req.session.nome : null
         
    })
    
    app.get("/login",async(req,res)=>{
        res.render("login",{
            titulo:'Entrar - Livros Online'
        })
    })
    


    app.get("/", (req, res) => {
        res.render(`index`, {
            titulo: "Conheça nossos livros",
            promo: "Todos os livros com 10% de desconto!",
            livro: consulta,
            galeria: consultaLivro
        })
    })


    app.get("/upd-promo", (req, res) => {
        res.render(`adm/atualiza-promocoes`, {
            titulo: "Conheça nossos livros",
            promo: "Todos os livros com 10% de desconto!",
            livro: consulta,
            galeria: consultaLivro
        })
    })

    app.get("/insere-livro", async (req, res) => {
        await db.insertLivro({
            titulo: "Guerra dos Mundos", resumo: "Lorem Lorem", valor: 80.14,
            imagem: "guerra-dos-mundos.jpg"
        })
        res.send("<h2>Livro adicionado!</h2><a href='./'>Voltar</a>")
    })


    app.get("/atualiza-promo", async (req, res) => {
        // let infoUrl = req.url
        // let urlProp = url.parse(infoUrl,true)//  /?id=5
        // let q = urlProp.query
        let qs = url.parse(req.url, true).query
        await db.updatePromo(qs.promo, qs.id)//localhost:8080/atualiza-promo?promo=1&id=9
        res.send("<h2>Lista de Promoções Atualizadas!</h2><a href='/promocoes'>Voltar</a>")
    })



    app.get("/promocoes", async (req, res) => {
        const consultaPromo = await db.selectPromo()
        res.render(`promocoes`, {
            titulo: "Conheça nossos livros",
            promo: "Todos os livros com 10% de desconto!",
            livro: consulta,
            galeria: consultaPromo
        })
    })


app.get("/carrinho",async(req,res)=>{
const consultaCarrinho = await db.selectCarrinho()
   res.render(`carrinho`,{
       titulo:"Conheça nossos livros",
       promo:"Todos os livros com 10% de desconto!",
       livro:consulta,
       carrinho:consultaCarrinho
   })
})

app.post("/carrinho",async(req,res)=>{
    const info=req.body
    await db.insertCarrinho({
        produto:info.produto,
        qtd:info.qtd,
        valor:info.valor,
        livros_id:info.livros_id
    })
    res.send(req.body)
    //res.redirect("/carrinho")
})


app.post("/delete-carrinho",async(req,res)=>{
    const info=req.body
    await db.deleteCarrinho(info.id)
    res.send(info)
    
})



    //single-produto?id=5
    app.get("/single-produto", async (req, res) => {
        let infoUrl = req.url
        let urlProp = url.parse(infoUrl, true)//  /?id=5
        let q = urlProp.query
        const consultaSingle = await db.selectSingle(q.id)
        const consultaInit = await db.selectSingle(4)
        res.render(`single-produto`, {
            titulo: "Conheça nossos livros",
            promo: "Todos os livros com 10% de desconto!",
            livro: consulta,
            galeria: consultaSingle
        })
    })

    app.get("/cadastro", async (req, res) => {
        let infoUrl = req.url
        let urlProp = url.parse(infoUrl, true)//  /?id=5
        let q = urlProp.query
        //const consultaSingle = await db.selectSingle(q.id)
        const consultaInit = await db.selectSingle(4)
        res.render(`cadastro`, {
            titulo: "Conheça nossos livros",
            promo: "Todos os livros com 10% de desconto!",
            livro: consulta,
            galeria: consultaInit
        })
    })


    app.get("/contato", async (req, res) => {
        let infoUrl = req.url
        let urlProp = url.parse(infoUrl, true)//  /?id=5
        let q = urlProp.query
        const consultaSingle = await db.selectSingle(q.id)
        const consultaInit = await db.selectSingle(4)
        res.render(`contato`, {
            titulo: "Conheça nossos livros",
            promo: "Todos os livros com 10% de desconto!",
            livro: consulta,
            galeria: consultaInit
        })
    })

    app.post("/contato", async (req, res) => {
        const info = req.body
        await db.insertContato({
            nome: info.cad_nome,
            sobrenome: info.cad_sobrenome,
            email: info.cad_email,
            mensagem: info.cad_mensagem
        })

        res.redirect("/promocoes")
    })


    app.post("/cadastro",async(req, res) => {
        const info=req.body
        await db.insertUsuario({
            nome:info.nome,
            email: info.email,
            telefone: info.telefone,
            senha: info.senha,
            conf_senha: info.conf_senha
        })
        res.render(`cadastro`,{
            titulo:"Conheça nossos livros",
            promo:"- Compre com 10% de desconto!"
        })
        
    })


    app.listen(port, () => console.log("Servidor rodando com nodemon!"))
})()