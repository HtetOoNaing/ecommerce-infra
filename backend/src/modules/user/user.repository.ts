import { Op } from "sequelize";
import { User } from "./user.model";
import { CreateUserDto, UserEntity } from "./user.types";

export class UserRepository {
  async create(data: CreateUserDto): Promise<UserEntity> {
    const user = await User.create(data);
    return user.toJSON() as UserEntity;
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await User.findAll();
    return users.map((u) => u.toJSON() as UserEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await User.findOne({ where: { email } });
    return user || null;
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await User.findByPk(id);
    return user ? (user.toJSON() as UserEntity) : null;
  }

  findByVerificationToken(token: string): Promise<User | null> {
    return User.findOne({ where: { verificationToken: token } });
  }

  findValidResetToken(token: string, now: Date): Promise<User | null> {
    return User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: now,
        },
      },
    });
  }
}