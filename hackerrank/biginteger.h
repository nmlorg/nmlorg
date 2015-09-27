#include <cstdint>
#include <iostream>
#include <vector>


class BigInteger {
 public:
  BigInteger(const uint64_t num) {
    AddPos(0, num);
  }

  BigInteger operator+(const BigInteger &rhs) const {
    BigInteger tmp(*this);

    return tmp += rhs;
  }

  BigInteger &operator+=(const BigInteger &rhs) {
    for (int i = 0; i < rhs.numbers.size(); i++)
      AddPos(i, rhs.numbers[i]);
    return *this;
  }

  BigInteger &operator++() {
    return *this += 1;
  }

  BigInteger operator*(const BigInteger &rhs) const {
    BigInteger tmp(0);

    for (BigInteger i(0); i < rhs; ++i)
      tmp += *this;
    return tmp;
  }

  bool operator<(const BigInteger &rhs) const {
    for (int i = max(numbers.size(), rhs.numbers.size()) - 1; i >= 0; i--) {
      uint64_t lhs_num = i < numbers.size() ? numbers[i] : 0;
      uint64_t rhs_num = i < rhs.numbers.size() ? rhs.numbers[i] : 0;

      if (lhs_num < rhs_num)
        return true;
      if (lhs_num > rhs_num)
        return false;
    }
    return false;
  }

  void AddPos(const int pos, uint64_t num) {
    if (num == 0)
      return;

    for (int i = numbers.size(); i <= pos; i++)
      numbers.push_back(0);

    if (num >> 63) {
      AddPos(pos + 1, num >> 63);
      num &= 0x7fffffffffffffff;
    }

    num += numbers[pos];

    if (num >> 63) {
      AddPos(pos + 1, num >> 63);
      num &= 0x7fffffffffffffff;
    }

    numbers[pos] = num;
  }

  friend ostream &operator<<(ostream &os, const BigInteger &rhs) {
    for (int i = rhs.numbers.size() - 1; i >= 0; i--)
      os << rhs.numbers[i];
    return os;
  }

 private:
  std::vector<uint64_t> numbers;
};
