async function conecta() {
    const mysql = require("mysql2/promise")
    const conn = await mysql.createConnection({
        host: "localhost",
        user: "s51",
        password: "Silvio7119$#@!",
        database: "filmes"
    })
    console.log("mySQL conectado!")
    global.connection = conn
    return connection
}
//conecta()

async function selectFilmes(){
    const conectado = await conecta()
    const [rows] = await conectado.query("SELECT f.titulo,f.genero,d.nome FROM videos as f INNER JOIN diretor as d ON f.diretor = d.diretor_id ORDER BY f.titulo ASC")
    //console.log(rows)
    return rows
}

async function selectLivros(){
    const conectado = await conecta()
    const [rows] = await conectado.query("SELECT * FROM livros ORDER BY livros_id DESC")
    //console.log(rows)
    return rows

}

async function selectCarrinho(){
    const conectado = await conecta()
    const [rows] = await conectado.query("SELECT * FROM carrinho ORDER BY carrinho_id DESC")
    //console.log(rows)
    return rows
}

async function selectSingle(id){
    const conectado = await conecta() 
    const values = [id]
    const [rows] = await conectado.query("SELECT * FROM livros Where livros_id=?",values)  
    //console.log(rows)
    return rows
}

async function selectPromo(){
    const conectado = await conecta() 
    const [rows] = await conectado.query("SELECT * FROM livros Where promo=1")  
    //console.log(rows)
    return rows
}

async function selectUsers(email,senha){
    const conectado = await conecta() 
    const values= [email,senha]
    const [rows] = await conectado.query("SELECT * FROM usuarios Where email=? AND senha=?",values)  
    //console.log(rows)
    return rows
}



async function updatePromo(promo,id){
    const conectado = await conecta();
    const values = [promo,id]
    return await conectado.query("UPDATE livros set promo=? Where livros_id=?",values)

}
//updatePromo(1,3)


//Deletar
async function deleteCarrinho(id){
    const conectado = await conecta();
    const values = [id]
    return await conectado.query("DELETE FROM carrinho Where carrinho_id=?",values)

}


async function insertLivro(livro){
    const conectado = await conecta() 
    const values = [livro.titulo,livro.resumo,livro.valor,livro.imagem]
    const [rows] = 
    await conectado.query("INSERT INTO livros(titulo,resumo,valor,imagem) VALUES (?,?,?,?)",values)  
    console.log("Insert ok!")
    return rows
}

async function insertContato(contato){
    const conectado = await conecta() 
    const values = [contato.nome,contato.sobrenome,contato.email,contato.mensagem]
    const [rows] = 
    await conectado.query("INSERT INTO contato(nome,sobrenome,email,mensagem) VALUES (?,?,?,?)",values)  
    console.log("Insert ok!")
    return rows
}

async function insertCarrinho(carrinho){
    const conectado = await conecta() 
    const values = [carrinho.produto,carrinho.qtd,carrinho.valor,carrinho.livros_id]
    const [rows] = 
    await conectado.query("INSERT INTO carrinho(produto,qtd,valor,livros_id) VALUES (?,?,?,?)",values)  
    console.log("Insert ok!")
    return rows
}

async function insertUsuario(usuario){ // Insere registro na tabela de forma manual
    const conectado = await conecta()
    const values = [usuario.nome,usuario.email,usuario.telefone,usuario.senha,usuario.conf_senha]
    const [rows] = await conectado.query("insert into usuarios(nome, email, telefone, senha, conf_senha) values(?,?,?,?,?)",values)
    //console.log("Insert OK!")
    return rows
}


// insertCadastro({
// nome:"Luna",
// email:"Maria",
// telefone:"luna@gmail.com",
// senha:123456,
// conf_senha:123456})

//selectFilmes()
//selectLivros()
//selectSingle(10)
//insertLivro({titulo:"Wild Fury",resumo:"Lorem Lorem",valor:40.35,imagem:"wild-fury.jpg"})

module.exports = {
    selectFilmes,
    selectLivros,
    selectSingle,
    selectPromo,
    selectCarrinho,
    selectUsers,
    insertLivro,
    insertContato,
    insertUsuario,
    insertCarrinho,
    updatePromo,
    deleteCarrinho
}
