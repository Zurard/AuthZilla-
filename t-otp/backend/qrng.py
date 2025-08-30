# program for qrng 

MAX_SIZE = 256 #for a seed of the max size

from qiskit import QuantumCircuit,transpile
from qiskit_aer import AerSimulator

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


bits = generate_random_bits(100)
print(bits)