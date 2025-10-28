# program for qrng 

from qiskit import QuantumCircuit,transpile
from qiskit_aer import AerSimulator

def qrng_random_int(bytes):
    rng =  []
    n=6
    max_val = 10
    while ( n > 0): 
        bits = generate_random_bits(16)
        num = int(''.join(map(str, bits)), 2)
        # print(num % max_val)
        rng.append(num % max_val)
        
        n -= 1
    return rng

def generate_random_bits(n_bits):
    bits = []
    sim = AerSimulator()
    #define a qubit and pass it thorough a Hamard Gate 
    while( n_bits >= 0):
        qc = QuantumCircuit(1,1)
        qc.h(0)
        qc.measure(0,0)
        tqc = transpile(qc, sim)
        job = sim.run(tqc,shots = 1)
        result = job.result()
        count = result.get_counts()
        bit = list(count.keys())[0]
        bits.append(int(bit))
        n_bits -= 1
    return bits

def bits_to_bytes(bits):    
    bytes_list = []
    for i in range(0, len(bits), 8):
        byte = 0
        for j in range(8):
            if i + j < len(bits):
                byte = (byte << 1) | bits[i + j]
        bytes_list.append(byte)
    return bytes_list


def generate_secret_key():
    bits = generate_random_bits(100)
    bytes = bits_to_bytes(bits)
    rng = qrng_random_int(bytes)
    secret_key = ''.join(map(str, rng))
    return secret_key

