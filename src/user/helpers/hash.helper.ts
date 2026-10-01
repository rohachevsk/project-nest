import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashHelper {
  private readonly _salt = 10;

  async hash(password: string): Promise<string> {
    const result = await bcrypt.hash(password, this._salt);
    console.log('Hash:', result);
    return result;
  }

  async isValidPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
