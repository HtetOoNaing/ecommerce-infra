import { Customer } from "./customer.model";
import { CreateCustomerDto, UpdateCustomerDto } from "./customer.types";

export class CustomerRepository {
  async findAll() {
    return Customer.findAll({ order: [["createdAt", "DESC"]] });
  }

  async findById(id: number) {
    return Customer.findByPk(id);
  }

  async findByEmail(email: string) {
    return Customer.findOne({ where: { email } });
  }

  async findByVerificationToken(token: string) {
    return Customer.findOne({ where: { verificationToken: token } });
  }

  async findByResetToken(token: string) {
    return Customer.findOne({ where: { resetPasswordToken: token } });
  }

  async create(data: CreateCustomerDto) {
    return Customer.create(data);
  }

  async update(id: number, data: Partial<UpdateCustomerDto>) {
    const [affected, rows] = await Customer.update(data, {
      where: { id },
      returning: true,
    });
    return affected > 0 ? rows[0] : null;
  }

  async updatePassword(id: number, password: string) {
    const [affected, rows] = await Customer.update(
      { password, resetPasswordToken: null, resetPasswordExpires: null },
      { where: { id }, returning: true }
    );
    return affected > 0 ? rows[0] : null;
  }

  async verifyEmail(id: number) {
    const [affected, rows] = await Customer.update(
      { emailVerified: true, verificationToken: null },
      { where: { id }, returning: true }
    );
    return affected > 0 ? rows[0] : null;
  }

  async setResetToken(id: number, token: string, expires: Date) {
    const [affected, rows] = await Customer.update(
      { resetPasswordToken: token, resetPasswordExpires: expires },
      { where: { id }, returning: true }
    );
    return affected > 0 ? rows[0] : null;
  }

  async setVerificationToken(id: number, token: string) {
    const [affected, rows] = await Customer.update(
      { verificationToken: token },
      { where: { id }, returning: true }
    );
    return affected > 0 ? rows[0] : null;
  }

  async updateShippingAddresses(id: number, addresses: any[]) {
    const [affected, rows] = await Customer.update(
      { shippingAddresses: addresses },
      { where: { id }, returning: true }
    );
    return affected > 0 ? rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const count = await Customer.destroy({ where: { id } });
    return count > 0;
  }
}
