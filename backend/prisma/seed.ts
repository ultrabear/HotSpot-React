import { prisma } from "../dbclient.js";
import bcrypt from "bcryptjs";

async function main() {
	await prisma.user.createMany({
		data: [
			{
				email: "demo@user.io",
				username: "Demo-lition",
				firstName: "John",
				lastName: "Doe",
				hashedPassword: bcrypt.hashSync("password1"),
			},
			{
				email: "user1@user.io",
				username: "FakeUser1",
				firstName: "Jane",
				lastName: "Doe",
				hashedPassword: bcrypt.hashSync("password2"),
			},
			{
				email: "user2@user.io",
				username: "FakeUser2",
				firstName: "among",
				lastName: "Us",
				hashedPassword: bcrypt.hashSync("foopassword"),
			},
		],
	});
}
main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
