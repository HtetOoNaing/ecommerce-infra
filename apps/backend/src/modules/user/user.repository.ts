import { Op } from "sequelize";
import { User } from "./user.model";
import { CreateUserDto, UserEntity, PaginatedResponse } from "./user.types";

export class UserRepository {
  async create(data: CreateUserDto): Promise<UserEntity> {
    const user = await User.create(data);
    return user.toJSON() as UserEntity;
  }

  async findAll(page: number, limit: number): Promise<PaginatedResponse<UserEntity>> {
    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      data: rows.map((u) => u.toJSON() as UserEntity),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
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

  findByIdRaw(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  async updateTotpSecret(userId: number, secret: string | null): Promise<void> {
    await User.update({ totpSecret: secret }, { where: { id: userId } });
  }

  async enableMfa(userId: number): Promise<void> {
    await User.update({ isMfaEnabled: true }, { where: { id: userId } });
  }

  async disableMfa(userId: number): Promise<void> {
    await User.update(
      { isMfaEnabled: false, totpSecret: null },
      { where: { id: userId } }
    );
  }
}