import { PrismaClient } from "@prisma/client";
import chalk from "chalk";

export const getAll = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(chalk.red(error));
        res.status(500).json({ message: "Internal Server Error" });
    }

};
