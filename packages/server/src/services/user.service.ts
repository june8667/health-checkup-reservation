import { User, IUser } from '../models/User';
import { AppError } from '../middleware/error.middleware';

export class UserService {
  async findById(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('사용자를 찾을 수 없습니다.', 404);
    }
    return user;
  }

  async update(
    userId: string,
    data: Partial<Pick<IUser, 'name' | 'phone' | 'address' | 'marketingConsent'>>
  ): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('사용자를 찾을 수 없습니다.', 404);
    }

    return user;
  }

  async delete(userId: string): Promise<void> {
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      throw new AppError('사용자를 찾을 수 없습니다.', 404);
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ users: IUser[]; total: number }> {
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return { users, total };
  }
}
