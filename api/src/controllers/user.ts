// Importa o modelo User para interagir com o banco de dados
import { Task, User } from "../db.js";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Função para listar o usuário
export async function getUsersById(req: Request, res: Response): Promise<void> {
    const id = req.params.id
    const user = await User.findById(id, '-password')

    if (!user) {
        res.status(404).json({ message: "Usuário não encontrado" });
        return;
    }

    res.status(200).json({ user })
}

// Função para registrar usuário
export async function registerUser(req: Request, res: Response): Promise<void> {
    const { name, email, password, confirmPassword } = req.body;

    //validacao
    if (!name) {
        res.status(422).json({ message: "O nome é obrigatório!" });
        return;
    }
    if (!email) {
        res.status(422).json({ message: "O e-mail é obrigatório!" });
        return;
    }
    if (!password) {
        res.status(422).json({ message: "A senha é obrigatória!" });
        return;
    }

    if (password !== confirmPassword) {
        res.status(422).json({ message: "As senhas não conferem!" });
        return;
    }

    // Verifica se já existe um usuário com o mesmo e-mail
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        res.status(422).json({ error: "E-mail já está em uso" });
        return;
    }

    // criar senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt);

    // criando usuario 
    const user = new User({
        name,
        email,
        password: passwordHash,
    })

    try {
        await user.save()
        res.status(201).json({ message: "Usuário criado com sucesso" });
        return;

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao salvar usuário" });
        return;
    }

}

// Função para fazer login na aplicacao 
export async function loginUser(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email) {
        res.status(422).json({ message: "O e-mail é obrigatório!" });
        return;
    }
    if (!password) {
        res.status(422).json({ message: "A senha é obrigatória!" });
        return;
    }

    //conferir se o usuario existe
    const user = await User.findOne({ email: email });
    if (!user) {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
    }

    //conferir se a senha esta correta
    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) {
        res.status(404).json({ message: "Senha inválida!" });
        return;
    }

    try {
        const secret: string = process.env.SECRET!;
        const token = jwt.sign(
            {
                id: user._id,
            },
            secret,
        )

        res.status(200).json({ message: "Autenticação realizada com sucesso", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao fazer login" });
        return;
    }

}

// Função para atualizar os dados de um usuário existente
export async function updateUser(req: Request, res: Response): Promise<void> {
    try {
        // Extrai os dados do corpo da requisição
        const { name, email } = req.body;

        // Cria um objeto com os dados a serem atualizados
        const userBody = {
            name,
            email,
        };

        // Atualiza o usuário no banco de dados pelo ID fornecido na URL
        const user = await User.findByIdAndUpdate(req.params.id, userBody, { new: true });

        // Retorna uma resposta de sucesso com os dados atualizados do usuário
        res.status(200).json({ message: "Dados de usuário atualizados com sucesso", user });
        return;
    } catch (error) {
        // Se ocorrer algum erro, exibe o erro no console e retorna um status 500 com a mensagem de erro
        console.error(error);
        res.status(500).json({ error: "Erro ao editar dados do usuário" });
        return;
    }
}

// Função para excluir um usuário
export async function deleteUser(req: Request, res: Response): Promise<void> {
    try {
        // Deleta o usuário do banco de dados pelo ID fornecido na URL
        const user = await User.findByIdAndDelete(req.params.id);

        // Retorna uma resposta de sucesso confirmando a exclusão
        res.status(200).json({ message: "Usuário deletado com sucesso", user });
        return;
    } catch (error) {
        // Se ocorrer algum erro, exibe o erro no console e retorna um status 500 com a mensagem de erro
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir usuário" });
        return;
    }
};

// Função para criar uma tarefa
export async function createTask(req: Request, res: Response): Promise<void> {
    const { name, category, priority, date, active } = req.body;

    // Captura o token do cabeçalho
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Acesso negado!" });
        return;
    }

    try {
        // Verifica o token e obtém o ID do usuário
        const secret = process.env.SECRET as string;
        const decoded = jwt.verify(token, secret) as { id: string };
        const userId = decoded.id;

        // Validação dos campos obrigatórios
        if (!name) {
            res.status(422).json({ message: "O nome é obrigatório!" });
            return;
        }
        if (!category) {
            res.status(422).json({ message: "A categoria é obrigatória!" });
            return;
        }
        if (!priority) {
            res.status(422).json({ message: "A prioridade é obrigatória!" });
            return;
        }
        if (!date) {
            res.status(422).json({ message: "A data é obrigatória!" });
            return;
        }

        // Verifica se já existe uma task com o mesmo nome, categoria e data para este usuário
        const existingTask = await Task.findOne({ name, category, date, userId });

        if (existingTask) {
            res.status(422).json({ error: "Essa task já existe para este usuário" });
            return;
        }

        // Criando task e vinculando ao usuário autenticado
        const task = new Task({
            name,
            category,
            priority,
            date,
            active,
            userId, // Vincula a tarefa ao usuário autenticado
        });

        await task.save();
        res.status(201).json({ message: "Tarefa criada com sucesso" });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao salvar tarefa" });
        return;
    }
};

// Função para ler uma tarefa
export async function getTask(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;  // Obtém o ID do usuário a partir da URL
    try {
        // Busca as tarefas associadas ao userId
        const tasks = await Task.find({ userId: userId });  // Filtra pelo userId
        console.log(userId)

        if (!tasks || tasks.length === 0) {
            res.status(404).json({ message: "Nenhuma tarefa encontrada para este usuário" });
            return;
        }

        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar as tarefas", error });
    }
};




