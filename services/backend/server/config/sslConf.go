package config

// REMIND: Problems with https SSL_ERROR_RX_RECORD_TOO_LONG

// import (
// 	"bytes"
// 	"crypto/rand"
// 	"crypto/rsa"
// 	"crypto/tls"
// 	"crypto/x509"
// 	"crypto/x509/pkix"
// 	"encoding/pem"
// 	"math/big"
// 	"net"
// 	"time"
// )

// func SSL_Setup() (serverTLSConf *tls.Config, err error) {
// 	// set up our CA certificate
// 	ca := &x509.Certificate{
// 		SerialNumber: big.NewInt(2019),
// 		Subject: pkix.Name{
// 			Organization:       []string{"GMZZ Corp ©"},
// 			OrganizationalUnit: []string{"Social Network"},
// 			Country:            []string{"FR"},
// 			Province:           []string{"Normandie"},
// 			Locality:           []string{"ROUEN"},
// 			StreetAddress:      []string{"some address"},
// 			PostalCode:         []string{"76000"},
// 			CommonName:         "Social Network",
// 		},
// 		NotBefore:             time.Now(),
// 		NotAfter:              time.Now().AddDate(10, 0, 0),
// 		IsCA:                  true,
// 		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
// 		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
// 		BasicConstraintsValid: true,
// 	}
// 	// create our private and public key
// 	caPrivKey, err := rsa.GenerateKey(rand.Reader, 4096)
// 	if err != nil {
// 		return nil, err
// 	}
// 	// create the CA
// 	caBytes, err := x509.CreateCertificate(rand.Reader, ca, ca, &caPrivKey.PublicKey, caPrivKey)
// 	if err != nil {
// 		return nil, err
// 	}
// 	// pem encode
// 	caPEM := new(bytes.Buffer)
// 	pem.Encode(caPEM, &pem.Block{
// 		Type:  "CERTIFICATE",
// 		Bytes: caBytes,
// 	})
// 	caPrivKeyPEM := new(bytes.Buffer)
// 	pem.Encode(caPrivKeyPEM, &pem.Block{
// 		Type:  "RSA PRIVATE KEY",
// 		Bytes: x509.MarshalPKCS1PrivateKey(caPrivKey),
// 	})
// 	// set up our server certificate
// 	cert := &x509.Certificate{
// 		SerialNumber: big.NewInt(2019),
// 		Subject: pkix.Name{
// 			Organization:       []string{"GMZZ Corp ©"},
// 			OrganizationalUnit: []string{"Social Network"},
// 			Country:            []string{"FR"},
// 			Province:           []string{"Normandie"},
// 			Locality:           []string{"ROUEN"},
// 			StreetAddress:      []string{"some address"},
// 			PostalCode:         []string{"76000"},
// 			CommonName:         "FORUM",
// 		},
// 		EmailAddresses: []string{"social.network@next.js"},
// 		IPAddresses:    []net.IP{net.IPv4(127, 0, 0, 1), net.IPv6loopback},
// 		NotBefore:      time.Now(),
// 		NotAfter:       time.Now().AddDate(10, 0, 0),
// 		SubjectKeyId:   []byte{1, 2, 3, 4, 6},
// 		ExtKeyUsage:    []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
// 		KeyUsage:       x509.KeyUsageDigitalSignature,
// 	}
// 	certPrivKey, err := rsa.GenerateKey(rand.Reader, 4096)
// 	if err != nil {
// 		return nil, err
// 	}
// 	certBytes, err := x509.CreateCertificate(rand.Reader, cert, ca, &certPrivKey.PublicKey, caPrivKey)
// 	if err != nil {
// 		return nil, err
// 	}
// 	certPEM := new(bytes.Buffer)
// 	pem.Encode(certPEM, &pem.Block{
// 		Type:  "CERTIFICATE",
// 		Bytes: certBytes,
// 	})
// 	certPrivKeyPEM := new(bytes.Buffer)
// 	pem.Encode(certPrivKeyPEM, &pem.Block{
// 		Type:  "RSA PRIVATE KEY",
// 		Bytes: x509.MarshalPKCS1PrivateKey(certPrivKey),
// 	})
// 	serverCert, err := tls.X509KeyPair(certPEM.Bytes(), certPrivKeyPEM.Bytes())
// 	if err != nil {
// 		return nil, err
// 	}
// 	serverTLSConf = &tls.Config{
// 		PreferServerCipherSuites: true,
// 		CurvePreferences: []tls.CurveID{
// 			tls.X25519,
// 			tls.CurveP256,
// 		},
// 		CipherSuites: []uint16{
// 			tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
// 			tls.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA,
// 			tls.TLS_RSA_WITH_AES_256_GCM_SHA384,
// 			tls.TLS_RSA_WITH_AES_256_CBC_SHA,
// 			tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
// 			tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
// 		},
// 		Certificates: []tls.Certificate{serverCert},
// 	}
// 	return
// }
