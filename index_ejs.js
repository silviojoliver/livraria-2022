(async () => {
    const { application } = require('express')
    const express = require('express')
    const app = express()
    const db = require("./db.js")
    const url = require("url")
    const bodyParser = require("body-parser")
    const session = require("express-session")
    const port = 8080

    // config para as variáveis post
    app.use(bodyParser.urlencoded({extended:false})) // Não faz a extensão para outras ramificações
    app.use(bodyParser.json())


    app.set("view engine", "ejs")
    app.use(express.static('livraria-2022'))
    app.use("/js",express.static("js"))
    app.use("/css",express.static("css"))
    app.use("/books",express.static("books"))
    app.use("/imgs",express.static("imgs"))


    const options ={
        expiration: 10800000,
        createDatabaseTable: true,
        schema: {
            tableName: 'session_tbl',
            columnNames: {
                session_id: 'session_id',
                expires: 'expires',
                data: 'data'
            }
        }  
    }


await db.makeSession(app,options,session)


function checkFirst(req, res, next) {
    if (!req.session.userInfo) {
      res.redirect('/promocoes');
    } else {
      next();
    }
  }

function checkAuth(req, res, next) {
    if (!req.session.userInfo) {
      res.send('Você não está autorizado para acessar esta página');
    } else {
      next();
    }
  }


var userInfo=''
app.locals.info = {
    user:userInfo
}
app.locals.titulo="Livraria 2022 - Área Administrativa"
app.locals.idProd=5


    const consulta = await db.selectFilmes()
    const consultaLivro = await db.selectLivros()
    const consultaCarrinho = await db.selectCarrinho()


    app.get("/login",(req, res) => {
        res.render('login',{
            titulo:'Entrar - Livros Online'
        })
    })

    app.use('/logout', function (req, res) {
        req.app.locals.info = {}
        req.session.destroy()
        res.clearCookie('connect.sid', { path: '/' });
        res.redirect("/login") 
     
})

    app.post("/login", async (req,res)=>{
        const {email,senha} = req.body
        const logado = await db.selectUsers(email,senha)
        if(logado != ""){
        req.session.userInfo = email
        userInfo = req.session.userInfo
        req.app.locals.info.user= userInfo
        res.redirect('/')
        } else {res.send("<h2>Login ou senha não conferem</h2>")}
    })

    app.get("/",checkFirst,(req, res) => { // Chama a página principal e traz as consultas através das variáveis
        res.render(`index`,{
            titulo:"Conheça nossos livros",
            promo:"- Compre com 10% de desconto!",
            livro:consulta,
            galeria:consultaLivro
        })
    })
//ADMIN==========================
    app.get("/adm",(req, res) => { 
        res.render('adm/index-adm',{
            galeria:consultaLivro
        })
    })

    app.get("/upd-form-produto",async(req, res) => { 
        const produto= await db.selectSingle(req.app.locals.idProd)
        res.render('adm/atualiza-produto',{
            galeria:consultaLivro,
            id:req.app.locals.idProd,
            produtoDaVez:produto
        })
    })

    app.post("/upd-form-produto",(req, res) => { 
       req.app.locals.idProd= req.body.id
        res.send('Produto Exibido com Sucesso')
    })

    app.post("/atualiza_single",async(req, res) => { 
        //resumo,imagem,valor,titulo,id
        const b = req.body
        await db.updateProduto(b.resumo,b.imagem,b.valor,b.titulo,b.id)
        
         res.send('Produto Atualizado com Sucesso')
     })

    app.get("/upd-promo",(req, res) => { // Chama a página principal e traz as consultas através das variáveis
        res.render(`adm/atualiza-promocoes`,{
            titulo:"Conheça nossos livros",
            promo:"- Compre com 10% de desconto!",
            livro:consulta,
            galeria:consultaLivro
        })
    })

    app.get("/insere-livro",async(req,res) => { // Chama a página insere-livros e insere um registro no banco de dados
        await db.insertLivro({resumo:"Lorem Guerra dos Mundos Lorem", imagem:"guerra-dos-mundos.jpg", valor:"80.14", titulo:"A Guerra dos Mundos"})
        res.send("<h3>Livro Adicionado!</h3><a href='./'>Voltar</a>")
    })

    app.get("/atualiza-promo",async(req,res) => { // Chama a página e altera o campo promo de um livro_id
        //let infoUrl = req.url
        //let urlProp = url.parse(infoUrl,true)
        //let q = urlProp.query
        let qs = url.parse(req.url,true).query
        await db.updatePromo(qs.promo,qs.id) // localhost:8080/atualiza-promo?promo=1&id=9  (No banco, o livro_id=(9), tem que estar com o campo promo=(0))
        res.send("<h3>Lista de Promoções Atualizada!</h3><a href='/promocoes'>Ver Promoções</a>")
    })
///FIM ADMIN=====================================
    app.get("/promocoes",async(req, res) => { // Chama a página promocoes e mostra os itens específicos
        const consultaPromo = await db.selectPromo()
        res.render(`promocoes`,{
            titulo:"Conheça nossos livros",
            promo:"- Compre com 10% de desconto!",
            livro:consulta,
            galeria:consultaPromo
        })
    })

    app.get("/contato",async(req, res) => {
        const consultaPromo = await db.selectPromo()
        res.render(`contato`,{
            titulo:"Conheça nossos livros",
            promo:"- Compre com 10% de desconto!",
            livro:consulta,
            galeria:consultaPromo
        })
    })

    app.post("/contato", async(req,res) => { // Recupera a informação do formulário e mostra na tela em formato json.
        const info=req.body
        await db.insertContato({
            nome:info.cad_nome,
            sobrenome:info.cad_sobrenome,
            email:info.cad_email,
            mensagem:info.cad_mensagem
        })
        //res.send(info),
        //res.send(info.cad_email)
        //res.send("Contato Cadastrado!")
        res.render(`contato`,{
            titulo:"Conheça nossos livros",
            promo:"- Compre com 10% de desconto!"
        })
    })

    app.get("/carrinho",checkAuth,async(req, res) => {
        const consultaCarrinhos = await db.selectCarrinho()
        res.render(`carrinho`,{
            titulo:"Conheça nossos livros",
            promo:"- Compre com 10% de desconto!",
            carrinho:consultaCarrinhos
        })
    })

    app.post("/carrinho-p", async(req,res) => { // Informações vindas do jquery post
        let info = req.body
        await db.insertCarrinho({
            produto:info.produto,
            qtd:info.qtd,
            valor:info.valor,
            livros_id:info.livros_id
        })
        res.send(req.body) 
    })

    app.post("/delete-carrinho", async(req,res) => { // Informações vindas do jquery post
        let info = req.body
        await db.deleteCarrinho(info.id)
        res.send(info) 
    })

    app.get("/single-produto",async(req, res) => { // Chamada da página através das páginas Index, Promoções, quando clicado em qualquer produto.
        let infoUrl = req.url
        let urlProp = url.parse(infoUrl,true)
        let q = urlProp.query
        const consultaSingle = await db.selectSingle(q.id)
        const consultaInit = await db.selectSingle(4)
        res.render(`single-produto`,{
            titulo:"Conheça nossos livros",
            promo:"- Compre com 10% de desconto!",
            livro:consulta,
            galeria:consultaSingle,
            inicio:consultaInit
        })
    })

    app.get("/cadastro",(req, res) => {
        res.render(`cadastro`,{
            titulo:"Conheça nossos livros",
            promo:"- Compre com 10% de desconto!",
            livro:consulta
        })
    })

    app.post("/cadastro",async(req, res) => {
        const info=req.body
        await db.insertUsuario({
            nome:info.us_nome,
            email:info.us_email,
            telefone:info.us_telefone,
            senha:info.us_senha,
            conf_senha:info.us_conf_senha
        })
        res.render('cadastro',{
            titulo:"Conheça nossos livros",
            promo:"- Compre com 10% de desconto!"
        })
    })

    app.listen(port, () => console.log(`Servidor rodando com nodemon na porta ${port} - ${__dirname}`))
})()